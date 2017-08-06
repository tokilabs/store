import { format as formatQuery, IConnection, IError, IPool } from 'mysql';
import { Delete, Insert, Update } from './dialects/mysql';
import { Store } from './store';
import { DTO, MAPPER, PK, TABLE, TABLE_NAME } from './symbols';
import { CriteriaOrBuilder } from './types';

import * as MySQL from './dialects/mysql';
import * as Types from './types';

import { Criteria } from './criteria';
import { IQuery } from './dialects/iQuery';
import { Table } from './mapping';
import { IOkResult } from './okResult';

import * as Debug from 'debug';
const debug = Debug('store');

export abstract class MysqlStore<TTable extends Table, TDto> extends Store {

  constructor(protected db: IPool) {
    super();
  }

  public get criteria(): Criteria<TTable> {
    return new Criteria<TTable>(this[Store.TABLE]);
  }

  private get newQuery(): IQuery<TTable> {
    return new MySQL.Query(new this[Store.TABLE]());
  }

  public find(queryOrBuilder: Types.QueryBuilder<TTable>, dtoMapper?: (rows: any[]) => TDto[]): Promise<TDto[]> {
    return this.runQuery(
      this.unwrap<IQuery<TTable>>(queryOrBuilder, this.newQuery)
    ).then((results) => dtoMapper ? dtoMapper(results) : this.mapResults(results));
  }

  public findOne(query: IQuery<TTable>): Promise<TDto>;
  public findOne(query: Types.QueryBuilder<TTable>): Promise<TDto>;
  public findOne(queryOrBuilder: Types.QueryOrBuilder<TTable>): Promise<TDto> {
    const query = this.unwrap<IQuery<TTable>>(queryOrBuilder, this.newQuery);

    debug('.findOne()');
    return this.runQuery(query)
      .then<TDto>( (result: any[]) => {
        if (result.length) {
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
          return result[0].value;
        }

        return defaultValue;
      });
  }

  public create(obj: TDto): Promise<TDto> {
    const insert = new Insert(new this[Store.TABLE](), obj);
    debug(insert.toString());

    const commands = [
      insert.toString(),
      `show columns from ${this[Store.TABLE][TABLE_NAME]} where extra like '%auto_increment%';`
    ];

    return this.trx(commands)
      .then(results => {
        const q = this.newQuery;

        if (results[1].length) {
          // we have an auto-increment column
          q.where(results[1][0].Field, results[0].insertId);
        }
        else {
          const pks = this[TABLE][PK];
          pks.forEach( (pk: string) => q.where(pk, obj[pk]));
        }

        return this.findOne(q);
      })
      .catch(err => {
        console.error('Error in query', err);
        throw err;
      });
  }

  public update(
      data: { [key in keyof TTable]?: any },
      criteriaOrBuilder: CriteriaOrBuilder<TTable>,
      excludeFields: (string & keyof TTable)[]): Promise<IOkResult> {
    const update = this.unwrap(
                          criteriaOrBuilder,
                          new Update<TTable, string & keyof TTable>(this[Store.TABLE], data, excludeFields));

    return this.runCommand(update.toString());
  }

  public delete(criteriaOrBuilder: CriteriaOrBuilder<TTable>): Promise<IOkResult> {
    const cmd = this.unwrap(criteriaOrBuilder, new Delete<TTable>(this[Store.TABLE]));

    return this.runCommand(cmd.toString());
  }

  private isOkResult(res: any): boolean {
    return res && res.changedRows !== undefined;
  }

  private trx(commands: string[]): Promise<any[]> {
    return new Promise<any[]>( (resolve, reject) => {
      this.db.getConnection((connErr: Error, conn: IConnection) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        conn.beginTransaction( err => {
          if (err) {
            console.error('Error starting transaction', err);
            throw err;
          }
        });

        return Promise.all(
          commands.map(c => new Promise( (res, rej) => {
            conn.query(c.toString(), (queryErr: IError, result: any[]) => {
              if (queryErr) {
                conn.release();
                console.error(queryErr);
                rej(queryErr);
              }

              res(result);
            });
          }))
        )
        .then( results => {
          conn.commit(reject);
          conn.release();
          resolve(results);
        });
      });
    });
  }

  private runQuery(query: IQuery<TTable>): Promise<any[]> {
    return new Promise<any[]>( (resolve, reject) => {
      this.db.getConnection((connErr: Error, conn: IConnection) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        debug(query.toString());
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

  private runCommand(command: string): Promise<any> {
    return new Promise<any[]>( (resolve, reject) => {
      this.db.getConnection((connErr: Error, conn: IConnection) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        debug(command.toString());
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
   * Map many results returning an array
   *
   * @private
   * @param {any[]} rows
   * @returns {TDto[]}
   * @memberof MysqlStore
   */
  private mapResults(rows: any[]): TDto[] {
    return rows.map(r => this.mapResult(r));
  }

  /**
   * Map a single result
   *
   * @private
   * @param {any[]} rows
   * @returns {TDto[]}
   *
   * @memberOf MysqlStore
   */
  private mapResult(row: any): TDto;
  private mapResult(rows: any): TDto {
    if (this[DTO][MAPPER])
      return this[DTO][MAPPER](rows);

    const d = new this[DTO]();

    Object.getOwnPropertyNames(rows).forEach(p => {
      d[p] = rows[p];
    });

    return d;
  }

  private unwrap<T>(objOrBuilder: any, ...args: any[]): T {
    if (typeof objOrBuilder === 'function') {
      return objOrBuilder(...args);
    }

    return objOrBuilder;
  }
}
