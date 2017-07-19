import { OrderDirection } from '@cashfarm/lang/lib';
import { Condition, ConditionGroup, ICondition, IConditionsMap, OP } from './condition';
import { Field, Table } from './mapping';
import { ConditionBuilder, FieldSelector } from './types';
import * as utils from './utils';
/**
 * Implements methods for defining a selection criteria
 *
 * @export
 * @class Criteria
 * @template TTable
 */
export class Criteria<TTable extends Table>  {

  protected $table: TTable;

  protected conditions: ConditionGroup;

  constructor(table: TTable) {
    if (!table)
      throw new Error('Can not create a criteria without specifying a table');

    this.$table = table;
    this.conditions = new ConditionGroup([], 'AND');
  }

  public where(condition: ConditionBuilder<TTable>): Criteria<TTable>;
  public where(field: string | FieldSelector<TTable>, value: number | number[] | string | string[]): Criteria<TTable>;
  public where(field: string | FieldSelector<TTable>, operator: string, value: any): Criteria<TTable>;
  public where(
        fieldOrConditions: string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable>,
        operatorOrValue?: number | number[] | string | string[],
        value?: any): Criteria<TTable> {

    const conds = this.convertToConditionsArray(fieldOrConditions, operatorOrValue, value);
    this.conditions = this.conditions.and(conds && conds.length && conds.length > 1 ? new ConditionGroup(conds, 'AND') : conds[0]);

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
  public whereAny(
            condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>,
            ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable> {
    if (conditions && conditions.length > 0) {
      conditions.push(<ConditionBuilder<TTable>> condition);
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
  public whereAll(
            condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>,
            ...conditions: ConditionBuilder<TTable>[]): Criteria<TTable> {
    if (conditions && conditions.length > 0) {
      conditions.push(<ConditionBuilder<TTable>> condition);
      condition = conditions;
    }

    this.conditions = this.conditions.and(new ConditionGroup(this.convertToConditionsArray(condition), 'AND'));

    return this;
  }

  private convertToConditionsArray(
            field: string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable>
                   | Array<string | IConditionsMap | FieldSelector<TTable> | ConditionBuilder<TTable>>,
            operatorOrValue?: any,
            value?: any): Array<ICondition> {

    // When passing an array of conditions
    if (Array.isArray(field)) {
      return field
        .map((f) => this.convertToConditionsArray(f))
        .reduce(
          (cArr, curr) => {
            cArr.push(curr[0]);

            return cArr;
          },
          []);
    }

    let op: string;

    if (value === undefined) {
      op = Array.isArray(operatorOrValue) ? OP.IN : OP.EQUALS;
      value = operatorOrValue;
    }
    else {
      op = operatorOrValue;
    }

    // When passing field as a string
    if (typeof field === 'string') {
      return [new Condition(field, op, value)];
    }

    // when we get a IFieldSelector or an IFieldMapper
    if (typeof field === 'function') {
      const f = field(this.$table);

      if (!f)
        throw new Error("Expression didn't return a value");

      const className = utils.getObjectClass(f);

      if ( (<any>f).selectExpr ) {
        return [new Condition( (<any>f).selectExpr, op, value)];
      }

      if (is<Condition>(f, Condition)) {
        return [f];
      }

      throw new Error("Expression returned a value that's neiither a field or a condition");
    }

    // when we get a conditions object
    if (typeof field === 'object') {
      const map = <IConditionsMap> field;
      const conds: Condition[] = [];

      // normalize conditions to Array
      Object.keys(map).forEach(fName => {
        Object.keys(map[fName]).forEach(opr => {
          conds.push( new Condition(fName, opr, map[fName][opr]) );
        });
      });

      return conds;
    }
  }
}

function is<T>(o: any, type: any): o is T {
  return o instanceof type || (typeof type === 'function' && type.name === utils.getObjectClass(o));
}

/**
 * Use this class to add criteria functionality in classes that provide chain methods.
 *
 * The CriteriaEnabled class uses generics to specify the return type of Criteria methods as
 * an instance of your subclass. This way, other methods in your class can be chained.
 *
 * @export
 * @abstract
 * @class CriteriaEnabled
 * @extends {Criteria<TTable>}
 * @template TTable
 * @template TSubclass
 */
export abstract class CriteriaEnabled<TTable extends Table, TSubclass extends CriteriaEnabled<TTable, TSubclass>> extends Criteria<TTable> {

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
    return <TSubclass> super.where(<any>fieldOrConditions, <any> operatorOrValue, value);
  }

  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {IConditionsMap|Array<ConditionBuilder<TTable>>} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: IConditionsMap | Array<ConditionBuilder<TTable>>): TSubclass;
  /**
   * Adds a group of conditions connect by an `OR` operator
   *
   * @param {IFieldMapper<T>} condition
   * @param {...IFieldMapper<T>[]} conditions
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAny(condition: ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): TSubclass;
  public whereAny(
            condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>,
            ...conditions: ConditionBuilder<TTable>[]): TSubclass {
    return (<TSubclass>super.whereAny(<any>condition, ...conditions));
  }

  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {IConditionsMap|Array<ConditionBuilder<TTable>>} condition
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: IConditionsMap | Array<ConditionBuilder<TTable>>): TSubclass;
  /**
   * Adds a group of conditions connect by an `AND` operator
   *
   * @param {IFieldMapper<T>} condition
   * @param {...IFieldMapper<T>[]} conditions
   * @returns {Criteria<T>}
   *
   * @memberOf Criteria
   */
  public whereAll(condition: ConditionBuilder<TTable>, ...conditions: ConditionBuilder<TTable>[]): TSubclass;
  public whereAll(
            condition: IConditionsMap | Array<ConditionBuilder<TTable>> | ConditionBuilder<TTable>,
            ...conditions: ConditionBuilder<TTable>[]): TSubclass {
    return (<TSubclass>super.whereAll(<any> condition, ...conditions));
  }
}
