import { Condition, ICondition, OP } from './condition';
import { FIELDS } from './symbols';

const _fieldMap = Symbol('field_map');

export abstract class Table {
  /**
   * Returns an object containing the table fields
   * indexed by their aliases.
   *
   * @readonly
   * @type {FieldMap}
   * @memberOf Table
   */
  public get [FIELDS](): Set<Field> {
    if (this[_fieldMap]) {
      return this[_fieldMap];
    }

    return this[_fieldMap] = this._findFields();
  }

  private _findFields(): Set<Field> {
    const set = new Set<Field>();

    Object.keys(this).forEach(p => {
      if (this[p] instanceof Field) {
        if (this[p].selectExpr !== p)
          this[p].alias = p;

        set.add(this[p]);
      }
    });

    return set;
  }

  // public Criteria(options?: ICriteriaOptions): Criteria<TTable> {
  //   return new Criteria<TTable>((<any>this)[TABLE_NAME], this as any, options);
  // }
}

export interface IField {
  selectExpr: string;
  alias?: string;
}

export class Field implements IField {
  public selectExpr: string;
  public alias: string;

  constructor(selectExpr: string, alias?: string) {
    if (!selectExpr || selectExpr.trim() == '')
      throw new Error('Field::constructor(): parameter selectExpr cannot be null or empty');

    
    this.selectExpr = selectExpr;
    this.alias = alias;
  }

  public toString() {
    return this.selectExpr;
  }

  equals(value: string | number): ICondition {
    return this.op(OP.EQUALS, value);
  }

  notEqual(value: string | number): ICondition {
    return this.op(OP.NOT_EQUAL, value);
  }

  in(values: number[] | string[]): ICondition {
    return this.op(OP.IN, values);
  }

  notIn(values: number[] | string[]): ICondition {
    return this.op(OP.NOT_IN, values);
  }

  isNull(): ICondition {
    return this.op(OP.IS, null);
  }

  protected op(op: string, value: any): ICondition {
    return new Condition(this.selectExpr, op, value);
  }
}

export class StringField extends Field {
  like(value: string): ICondition {
    return this.op(OP.LIKE, value);
  }

  isNullOrEmpty(): ICondition {
    return this.op('ISNULL(NULLIF(?,""))', undefined);
  }
}

export class NumberField extends Field {
  between(min: number, max: number): ICondition {
    return this.op('BETWEEN', [min, max]);
  }

  notBetween(min: number, max: number): ICondition {
    return this.op('NOT BETWEEN', [min, max]);
  }

  gt(value: number): ICondition {
    return this.op('>', value);
  }

  gte(value: number): ICondition {
    return this.op('>=', value);
  }

  lt(value: number): ICondition {
    return this.op('<', value);
  }

  lte(value: number): ICondition {
    return this.op('<=', value);
  }
}

export class BooleanField extends Field {
  isTrue(): ICondition {
    return this.op(OP.EQUALS, true);
  }

  isFalse(): ICondition {
    return this.op(OP.EQUALS, false);
  }
}

export class DateField extends Field {
  before(date: string): ICondition;
  before(date: number): ICondition;
  before(date: Date): ICondition;
  before(date: string|number|Date): ICondition {
    if (typeof date === 'number')
      return this.op(OP.LOWER, new Date(date));

    if (typeof date == 'string')
      return this.op(OP.LOWER, new Date(date));

    return this.op(OP.LOWER, date);
  }

  after(date: string): ICondition;
  after(date: number): ICondition;
  after(date: Date): ICondition;
  after(date: string|number|Date): ICondition {
    if (typeof date === 'number')
      return this.op(OP.GREATER, new Date(date));

    if (typeof date == 'string')
      return this.op(OP.GREATER, new Date(date));

    return this.op(OP.GREATER, date);
  }

  from(date: string): ICondition;
  from(date: number): ICondition;
  from(date: Date): ICondition;
  from(date: string|number|Date): ICondition {
    if (typeof date === 'number')
      return this.op(OP.LOWER_OR_EQUAL, new Date(date));

    if (typeof date == 'string')
      return this.op(OP.LOWER_OR_EQUAL, new Date(date));

    return this.op(OP.LOWER_OR_EQUAL, date);
  }

  until(date: string): ICondition;
  until(date: number): ICondition;
  until(date: Date): ICondition;
  until(date: string|number|Date): ICondition {
    if (typeof date === 'number')
      return this.op(OP.GREATER_OR_EQUAL, new Date(date));

    if (typeof date == 'string')
      return this.op(OP.GREATER_OR_EQUAL, new Date(date));

    return this.op(OP.GREATER_OR_EQUAL, date);
  }
}
