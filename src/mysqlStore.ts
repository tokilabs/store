import { injectable, unmanaged } from 'inversify';
import { format as formatQuery, IConnection, IError, IPool } from 'mysql';
import { Delete, Insert, Query, Update } from './dialects/mysql';
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

@injectable()
export abstract class MysqlStore<TTable extends Table, TDto> extends Store {

  constructor(@unmanaged() protected db: IPool) {
    super();
  }

  protected get newQuery(): IQuery<TTable> {
    return new MySQL.Query(new this[Store.TABLE]());
  }

  protected find(queryOrBuilder: Types.QueryBuilder<TTable>, dtoMapper?: (rows: any[]) => TDto[]): Promise<TDto[]> {
    return this.runQuery(
      this.unwrap<IQuery<TTable>>(queryOrBuilder, this.newQuery)
    ).then((results) => dtoMapper ? dtoMapper(results) : this.mapResults(results));
  }

  protected findOne(query: IQuery<TTable>): Promise<TDto>;
  protected findOne(query: Types.QueryBuilder<TTable>): Promise<TDto>;
  protected findOne(queryOrBuilder: Types.QueryOrBuilder<TTable>): Promise<TDto> {
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
   * Select a single field or expression and return its value
   *
   * @protected
   * @template TScalar
   * @param {string} expression A select expression. E.g. "COUNT(id)"
   * @param {TScalar} [defaultValue] The value to return if result is null or undefined
   * @returns {Promise<TScalar>}
   * @memberof MysqlStore
   */
  protected compute<TScalar>(expression: string, defaultValue?: TScalar): Promise<TScalar>;
  /**
   * Select a single field or expression and return its value
   *
   * @protected
   * @template TScalar
   * @param {Types.QueryOrBuilder<TTable>} queryOrBuilder A query or a query builder function. E.g. `t => t.id`
   * @param {TScalar} [defaultValue] The value to return if result is null or undefined
   * @returns {Promise<TScalar>}
   * @memberof MysqlStore
   */
  protected compute<TScalar>(queryOrBuilder: Types.QueryOrBuilder<TTable>, defaultValue?: TScalar): Promise<TScalar>;
  protected compute<TScalar>(expression: string | Types.QueryOrBuilder<TTable>, defaultValue: TScalar = null): Promise<TScalar> {
    let query: Query<TTable> = null;

    if (typeof expression === 'string')
      query = <Query<TTable>> this.newQuery.select(t => [{ selectExpr: expression, alias: 'value' }]);
    else {
      query = <Query<TTable>> this.unwrap<IQuery<TTable>>(expression, this.newQuery);

      if (query.Select.size !== 1) {
        throw new Error('When using compute method you must select exactly one field or expression');
      }

      // override alias
      query.Select.values().next().value.alias = 'value';
    }

    debug('compute:', query);
    return this.runQuery(query)
      .then<TScalar>( (result: any[]) => {

        debug('Compute result:', result);
        if (result.length) {
          return result[0].value;
        }

        return defaultValue;
      });
  }

  protected create(obj: TDto): Promise<TDto> {
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

  protected update(
      data: { [key in keyof TTable]?: any },
      criteriaOrBuilder: CriteriaOrBuilder<TTable>,
      excludeFields: (string & keyof TTable)[] = []): Promise<IOkResult> {
    const update = this.unwrap(
                          criteriaOrBuilder,
                          new Update<TTable, string & keyof TTable>(new this[Store.TABLE](), data, excludeFields));

    return this.runCommand(update.toString());
  }

  protected delete(criteriaOrBuilder: CriteriaOrBuilder<TTable>): Promise<IOkResult> {
    const cmd = this.unwrap(criteriaOrBuilder, new Delete<TTable>(new this[Store.TABLE]()));

    return this.runCommand(cmd.toString());
  }

  protected runCommand(command: string): Promise<any> {
    return new Promise<any[]>( (resolve, reject) => {
      this.db.getConnection((connErr: Error, conn: IConnection) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        debug(`Command query: ${command.toString()}`);
        conn.query(command.toString(), (queryErr: IError, result: any[]) => {
          if (queryErr) {
            conn.release();
            queryErr.message += ` Query: ${command.toString()}`;
            return reject(queryErr);
          }

          debug('Command result:', result);
          conn.release();
          resolve(result);
        });
      });
    });
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
        })
        .catch(err => {
          conn.rollback(reject);
          conn.release();
          reject(err);
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
  private mapResult(row: any): TDto {
    if (this[DTO][MAPPER])
      return this[DTO][MAPPER](row);

    const d = new this[DTO]();

    Object.getOwnPropertyNames(row).forEach(p => {
      d[p] = row[p];
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
