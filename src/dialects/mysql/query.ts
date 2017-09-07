import * as MySQL from './util';

import { OrderDirection } from '@cashfarm/lang/lib';

import { Field, Table, IField } from '../../mapping';
import { FIELDS, TABLE_NAME } from '../../symbols';
import { FieldOrSelector } from '../../types';
import { IQuery } from '../iQuery';
import { Whereable } from './whereable';

import { sortBy } from 'lodash';

export interface  IOrderByCriteria {
  field: Field;
  direction: OrderDirection;
}

export class Query<TTable extends Table> extends Whereable<TTable, Query<TTable>> implements IQuery<TTable> {

  protected _select: Set<Field>;
  public get Select(): Set<Field> {
    return this._select;
  }

  protected _orderBy: IOrderByCriteria[];
  public get OrderBy(): IOrderByCriteria[] {
    return this._orderBy;
  }

  protected _groupBy: Field[];
  public get GroupBy(): Field[] {
    return this._groupBy;
  }

  protected _limit: number;
  public get Limit(): number {
    return this._limit;
  }

  protected _offset: number;
  public get Offset(): number {
    return this._offset;
  }

  constructor(table: TTable) {
    super(table);
  }

  /**
   * Defines the set of fields that will be selected from the table.
   *
   * @param {string[]} fields An array of field names
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public select(fieldListSelector: (table: TTable) => Field[]): Query<TTable> {
    const fields = fieldListSelector(this.$table);

    if (!fields.length)
      throw new Error('Criteria::select(): fieldListSelector did not return any fields');

    this._select = new Set(fields);

    return this;
  }

  /**
   * Appends `field` to the list of ordering fields.
   *
   * @param {string} field
   * @param {OrderDirection} direction
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  public orderBy(field: FieldOrSelector<TTable>, direction: OrderDirection): Query<TTable>;
  public orderBy(field: [FieldOrSelector<TTable>, OrderDirection], ...otherFields: Array<[FieldOrSelector<TTable>, OrderDirection]>): Query<TTable>;
  public orderBy(field: any, directionOrRest?: any): Query<TTable> {

    if (Array.isArray(directionOrRest)) {
      [field, ...directionOrRest].forEach(f =>
        this._orderBy.push({
          field: this.unwrap(f[0]),
          direction: f[1]
        })
      );
    }
    else if (Array.isArray(field)) {
      this._orderBy.push({
        field: this.unwrap(field[0]),
        direction: field[1]
      });
    }
    else {
      this._orderBy.push({ field: this.unwrap(field), direction: directionOrRest || 'ASC' });
    }

    return this;
  }

  /**
   * Sets the list of grouping fields.
   *
   * @param {...string[]} fields
   * @returns
   *
   * @memberOf Query
   */
  public groupBy(fields: FieldOrSelector<TTable>[]): Query<TTable>;
  public groupBy(field: FieldOrSelector<TTable>, ...fields: FieldOrSelector<TTable>[]): Query<TTable>;
  public groupBy(fields: FieldOrSelector<TTable> | FieldOrSelector<TTable>[], ...rest: FieldOrSelector<TTable>[]): Query<TTable> {
    let fieldArr: FieldOrSelector<TTable>[] = [];

    // ir we got an array...
    if (Array.isArray(fields)) {
      fieldArr = fields;
    }
    // if we got variable number of arguments...
    else if (Array.isArray(rest) && rest.length) {
      fieldArr = [fields as FieldOrSelector<TTable>, ...rest];
    }
    // else, we got a single field
    else {
      fieldArr = [fields];
    }

    this._groupBy = fieldArr.map(f => typeof f == 'function' ? f(this.$table) : f);

    return this;
  }

  /**
   * Sets the limit of items returned
   *
   * @param {number} limit
   * @returns
   *
   * @memberOf Query
   */
  public limit(limit: number) {
    this._limit = limit;
    return this;
  }

  /**
   * Sets the index of the first item to be returned
   *
   * @param {number} offset
   * @returns
   *
   * @memberOf Query
   */
  public offset(offset: number) {
    this._offset = offset;
    return this;
  }

  /**
   * Clears the list of ordering fields
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  public clearSelect(): Query<TTable> {
    this._select = new Set();
    return this;
  }

  /**
   * Clears the list of ordering fields
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  public clearOrderBy(): Query<TTable> {
    this._orderBy = [];
    return this;
  }

  /**
   * Clears the list of grouping fields
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  public clearGroupBy(): Query<TTable> {
    this._groupBy = [];
    return this;
  }

  /**
   * Clears the limit option
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  public clearLimit(): Query<TTable> {
    this._limit = undefined;
    return this;
  }

  /**
   * Clears the offset option
   *
   * @returns {Criteria<T>}
   *
   * @memberOf Query
   */
  public clearOffset(): Query<TTable> {
    this._offset = null;
    return this;
  }

  public toString(): string {
    let orderBy = '';
    let groupBy = '';
    const limit = this.Limit == null ? '' : `LIMIT ${this.Limit}`;
    const offset = this.Offset == null ? '' : `OFFSET ${this.Offset}`;

    if (this.OrderBy) {
      orderBy = `ORDER BY ${
        this.OrderBy.map<string>(
          val => `${val.field} ${val.direction.toString()}`
        ).join(', ')}`;
    }

    if (this.GroupBy) {
      groupBy = `GROUP BY ${
        this.GroupBy.map<string>(val => `${val}`).join(', ')}`;
    }

    return `${
        this.buildSelect()
      } FROM \`${this.$table[TABLE_NAME]}\` ${
        this.buildWhere()
      }${
        groupBy
      }${
        orderBy
      }${
        limit
      }${
        offset};`.replace(/\s+/g, ' ').trim();
  }

  private buildSelect(fields?: IField[]): string {
    let fieldSource: Set<IField>;
    const expr: string[] = [];

    if (fields && fields.length) {
      fieldSource = new Set<IField>(fields);
    }
    if (this.Select && this.Select.size) {
      fieldSource = this.Select;
    }
    else {
      fieldSource = this.$table[FIELDS];
    }

    sortBy(Array.from(fieldSource), f => f.selectExpr).forEach( (field: IField) => {
      expr.push(MySQL.format(`${field.selectExpr}${field.alias ? ' as ??' : ''}`, [field.alias]));
    });

    return `SELECT ${expr.join(', ')}`;
  }

  private unwrap(field: FieldOrSelector<TTable>): Field {
    if (typeof field === 'function')
      return field(this.$table);

    return field;
  }
}
