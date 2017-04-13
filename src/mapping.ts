import { ICondition } from './condition';
import { OP, Condition } from './condition';
import { FIELDS } from './symbols';

// export interface IFieldMap {
//   [fieldName: string]: Field;
// }

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
        if (this[p].selectExpr != p)
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

  protected op(op: string, value: any): ICondition {
    return new Condition(this.selectExpr, op, value);
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

  private toDbDateString(date: Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  before(date: Date): ICondition {
    return this.op(OP.LOWER, this.toDbDateString(date));
  }

  after(date: Date): ICondition {
    return this.op(OP.GREATER, this.toDbDateString(date));
  }

  from(date: Date): ICondition {
    return this.op(OP.LOWER_OR_EQUAL, this.toDbDateString(date));
  }

  until(date: Date): ICondition {
    return this.op(OP.GREATER_OR_EQUAL, this.toDbDateString(date));
  }
}
