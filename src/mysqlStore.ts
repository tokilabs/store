import { Update } from './dialects/mysql/update';
import { CriteriaOrBuilder } from './types';
import { IError, IConnection, IPool, format as formatQuery } from 'mysql';
import { Store } from './store';

import * as MySQL from './dialects/mysql';
import * as Types from './types';

import { Criteria } from './criteria';
import { Table } from './mapping';
import { IOkResult } from './okResult';
import { IQuery } from './dialects/iQuery';


const debug = require('debug')('store');

export abstract class MysqlStore<TTable extends Table, TDto> extends Store {

  constructor(protected db: IPool) {
    super();
  }

  public get criteria(): Criteria<TTable> {
    return new Criteria<TTable>(this[Store.TABLE]);
  }

  private runQuery(query: IQuery<TTable>): Promise<any[]> {
    return new Promise<any[]>( (resolve, reject) => {
      this.db.getConnection((connErr: Error, conn: IConnection) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        conn.query(query.toString(), (queryErr: IError, rows: any[]) => {
          if (queryErr) {
            conn.release();
            return reject(queryErr);
          }

          conn.release();
          resolve(rows);
        });
      });
    });
  }

  private runCommand(command: string): Promise<any[]> {
    return new Promise<any[]>( (resolve, reject) => {
      this.db.getConnection((connErr: Error, conn: IConnection) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        conn.query(command.toString(), (queryErr: IError, result: any[]) => {
          if (queryErr) {
            conn.release();
            return reject(queryErr);
          }

          conn.release();
          resolve(result);
        });
      });
    });
  }

  /**
   * Converts rows to DTOs
   *
   * @private
   * @param {any[]} rows
   * @returns {TDto[]}
   *
   * @memberOf MysqlStore
   */
  private mapResult(rows: any[]): TDto[] {
    return [];
  }

  private unwrap<T>(objOrBuilder: any, ...args: any[]): T {
    if (typeof objOrBuilder === 'function') {
      return objOrBuilder(...args);
    }

    return objOrBuilder;
  }

  private get newQuery(): IQuery<TTable> {
    return new MySQL.Query(this[Store.TABLE]);
  }

  public find(queryOrBuilder: Types.QueryBuilder<TTable>, dtoMapper?: {(rows: any[]): TDto[]}): Promise<TDto[]> {
    return this.runQuery(
      this.unwrap<IQuery<TTable>>(queryOrBuilder, this.newQuery)
    ).then(dtoMapper || this.mapResult);
  }

  public findOne(query: IQuery<TTable>): Promise<TDto>;
  public findOne(query: Types.QueryBuilder<TTable>): Promise<TDto>;
  public findOne(queryOrBuilder: Types.QueryOrBuilder<TTable>): Promise<TDto> {
    const query = this.unwrap<IQuery<TTable>>(queryOrBuilder, this.newQuery);

    debug('FindOne:', query);
    return this.runQuery(query)
      .then<TDto>( (result: any[]) => {
        if (result.length) {
          debug('FindOne result:', result[0]);
          return this.mapResult(result)[0];
        }

        return null;
      });
  }

  /**
   * Returns the `value` field of the first returned row
   */
  public compute<TScalar>(queryOrBuilder: Types.QueryOrBuilder<TTable>, defaultValue: any = null): Promise<TScalar> {
    const query = this.unwrap<IQuery<TTable>>(queryOrBuilder, this.newQuery);

    debug('compute:', query);
    return this.runQuery(query)
      .then<TScalar>( (result: any[]) => {

        debug('compute result:', query);
        if (result.length) {
          return result[0].value as TScalar;
        }

        return defaultValue;
      });
  }

  public update(
      data: { [key in keyof TTable]?: any },
      criteriaOrBuilder: CriteriaOrBuilder<TTable>,
      excludeFields: (string & keyof TTable)[]): Promise<IOkResult> {
    const update = this.unwrap(criteriaOrBuilder,
        new Update<TTable, string & keyof TTable>(this[Store.TABLE], data, excludeFields));

    return this.runCommand(update.toString()) as any;
  }

  // @todo: implement create()

  // public create(obj: TDto, exclude: string[] = [], criteria: Criteria<TTable>): Promise<IOkResult> {
  //   const [query, data] = new MySQLDialect().toInsert(criteria, obj, exclude);
  //   debug('Create:', formatQuery(query, data));
  //   return this.query(query, data) as any;
  // }

  // @todo: impelement delete()

  // public save(obj: TDto, exclude: string[] = [], criteria: Criteria<TTable>): Promise<IOkResult> {
  //   const pk = criteria.fields[Criteria.PK];
  //   debug('Save: PK - ', pk, obj[pk]);
  //   if (obj[pk])
  //     return this.update(obj, criteria);

  //   exclude.push(pk);
  //   return this.create(obj, exclude, criteria);
  // }
}

export default MysqlStore;
