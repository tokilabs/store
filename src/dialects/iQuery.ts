import { CriteriaEnabled } from '../criteria';
import {OrderDirection} from '@cashfarm/lang/lib';
import {Table, Field} from '../mapping';
import { FieldOrSelector, ConditionBuilder } from '../types';

export interface IQuery<TTable extends Table> extends CriteriaEnabled<TTable, IQuery<TTable>> {

  /**
   * Defines the set of fields that will be selected from the table.
   *
   * @param {string[]} fields An array of field names
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  select(fieldListSelector: (table: TTable) => Field[]): IQuery<TTable>;

  /**
   * Appends `field` to the list of ordering fields.
   *
   * @param {string} field
   * @param {OrderDirection} direction
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  orderBy(field: FieldOrSelector<TTable>, direction: OrderDirection): IQuery<TTable>;
  orderBy(field: [FieldOrSelector<TTable>, OrderDirection], ...otherFields: Array<[FieldOrSelector<TTable>, OrderDirection]>): IQuery<TTable>;

  /**
   * Sets the list of grouping fields.
   *
   * @param {...string[]} fields
   * @returns
   *
   * @memberOf Query
   */
  groupBy(fields: FieldOrSelector<TTable>[]): IQuery<TTable>;
  groupBy(...fields: FieldOrSelector<TTable>[]): IQuery<TTable>;

  /**
   * Sets the limit of items returned
   *
   * @param {number} limit
   * @returns
   *
   * @memberOf Query
   */
  limit(limit: number): IQuery<TTable>;

  /**
   * Sets the index of the first item to be returned
   *
   * @param {number} offset
   * @returns
   *
   * @memberOf Query
   */
  offset(offset: number): IQuery<TTable>;

  /**
   * Clears the list of ordering fields
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  clearSelect(): IQuery<TTable>;

  /**
   * Clears the list of ordering fields
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  clearOrderBy(): IQuery<TTable>;

  /**
   * Clears the list of grouping fields
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  clearGroupBy(): IQuery<TTable>;

  /**
   * Clears the limit option
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  clearLimit(): IQuery<TTable>;

  /**
   * Clears the offset option
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  clearOffset(): IQuery<TTable>;
}

export default IQuery;
