import {OrderDirection} from '@cashfarm/lang/lib';
import { ConditionBuilder, FieldSelector } from './types';
import { OP, Condition, ICondition, ConditionGroup, IConditionsMap } from './condition';
import { Field, Table } from './mapping';

export class Criteria<TTable extends Table>  {

  protected $table: TTable;

  protected _conditions: ConditionGroup;

  protected get conditions(): ConditionGroup {
    return this._conditions;
  }

  protected set conditions(val: ConditionGroup) {
    this._conditions = val;
  }

  constructor(table: TTable) {
    this.$table = table;
    this.conditions = new ConditionGroup([], 'AND');
  }

  private convertToConditionsArray(
            field: string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable> | Array<string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable>>,
            operatorOrValue?: any,
            value?: any): Array<ICondition> {

    // When passing an array of conditions
    if (Array.isArray(field)) {
      return field.map((f) => this.convertToConditionsArray(f)).reduce( (cArr, curr) => {
        cArr.push(curr[0]);
        return cArr;
      }, []);
    }

    let op: string;

    if (typeof value === 'undefined') {
      op = Array.isArray(operatorOrValue) ? OP.IN : OP.EQUALS;
      value = operatorOrValue;
    }

    // When passing field as a string
    if (typeof field === 'string') {
      return [new Condition(field, op, value)];
    }

    // when we get a IFieldSelector or an IFieldMapper
    if (typeof field === 'function') {
      const f = field(this.$table);

      if (!f)
        throw new Error("Expression didn't return a field or a condition");

      if (f instanceof Field)
        return [new Condition(f.selectExpr, op, value)];

      if (f instanceof Condition)
        return [f];
    }

    // when we get a conditions object
    if (typeof field === 'object') {
      const map = field as IConditionsMap;
      const conds: Condition[] = [];

      // normalize conditions to Array
      Object.keys(map).forEach(fName => {
        Object.keys(map[fName]).forEach(op => {
          conds.push( new Condition(fName, op, map[fName][op]) );
        });
      });

      return conds;
    }
  }

  public where(condition: ConditionBuilder<TTable>): Criteria<TTable>;
  public where(field: string | FieldSelector<TTable>, value: number | number[] | string | string[]): Criteria<TTable>;
  public where(field: string | FieldSelector<TTable>, operator: string, value: any): Criteria<TTable>;
  public where(
        fieldOrConditions: string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable>,
        operatorOrValue?: number | number[] | string | string[],
        value?: any): Criteria<TTable> {

    const conds = this.convertToConditionsArray(fieldOrConditions, operatorOrValue, value);

    this.conditions = this.conditions.and(conds.length > 1 ? new ConditionGroup(conds, 'AND') : conds[0]);

    return this;
  }

  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {IConditionsMap} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: IConditionsMap): Criteria<TTable>;
  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {Array<IFieldMapper<T>>} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: Array<ConditionBuilder<TTable>>): Criteria<TTable>;
  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {IFieldMapper<T>} condition
   * @param {...IFieldMapper<T>[]} conditions
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable>;
  public whereAny(condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable> {
    if (conditions && conditions.length > 0) {
      conditions.push(condition as ConditionBuilder<TTable>);
      condition = conditions;
    }

    this.conditions = this.conditions.and(new ConditionGroup(this.convertToConditionsArray(condition), 'OR'));

    return this;
  }

  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {IConditionsMap} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: IConditionsMap): Criteria<TTable>;
  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {Array<IFieldMapper<T>>} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: Array<ConditionBuilder<TTable>>): Criteria<TTable>;
  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {IFieldMapper<T>} condition
   * @param {...IFieldMapper<T>[]} conditions
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable>;
  public whereAll(condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable> {
    if (conditions && conditions.length > 0) {
      conditions.push(condition as ConditionBuilder<TTable>);
      condition = conditions;
    }

    this.conditions = this.conditions.and(new ConditionGroup(this.convertToConditionsArray(condition), 'AND'));

    return this;
  }
}

export class CriteriaEnabled<TTable extends Table, TSubclass extends CriteriaEnabled<TTable, TSubclass>> extends Criteria<TTable> {

  constructor(table: TTable) {
    super(table);
  }

  public where(condition: ConditionBuilder<TTable>): TSubclass;
  public where(field: string | FieldSelector<TTable>, value: number | number[] | string | string[]): TSubclass;
  public where(field: string | FieldSelector<TTable>, operator: string, value: any): TSubclass;
  public where(
        fieldOrConditions: string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable>,
        operatorOrValue?: number | number[] | string | string[],
        value?: any): TSubclass {
    return super.where(fieldOrConditions as any, operatorOrValue as any, value) as TSubclass;
  }

    /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {IConditionsMap} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: IConditionsMap): TSubclass;
  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {Array<IFieldMapper<T>>} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: Array<ConditionBuilder<TTable>>): TSubclass;
  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {IFieldMapper<T>} condition
   * @param {...IFieldMapper<T>[]} conditions
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable>;
  public whereAny(condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): TSubclass {
    return super.whereAny(condition as any, ...conditions) as TSubclass;
  }

    /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {IConditionsMap} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: IConditionsMap): TSubclass;
  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {Array<IFieldMapper<T>>} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: Array<ConditionBuilder<TTable>>): TSubclass;
  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {IFieldMapper<T>} condition
   * @param {...IFieldMapper<T>[]} conditions
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable>;
  public whereAll(condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): TSubclass {
    return super.whereAll(condition as any, ...conditions) as TSubclass;
  }
}

export default Criteria;
