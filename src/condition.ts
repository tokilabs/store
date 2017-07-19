export const OP = {
  EQUALS: '=',
  NOT_EQUAL: '!=',
  GREATER: '>',
  GREATER_OR_EQUAL: '>=',
  LOWER: '<',
  LOWER_OR_EQUAL: '<=',
  LIKE: 'LIKE',
  IN: 'IN',
  NOT_IN: 'NOT IN',
  BETWEEN: 'BETWEEN',
  NOT_BETWEEN: 'NOT BETWEEN',
  IS: 'IS'
};

// export interface ICondition {
//   field: string;
//   op: string;
//   value: any;
// }

/**
 * Represents a single condition
 */
export interface ICondition {
  and(cond: ICondition): ICondition;
  or(cond: ICondition): ICondition;
}

/**
 * Example
 *
 * {
 *    "gender": { "=": "male" },
 *    "species": { "IN": ["cat", "dog"]}
 * }
 *
 * @export
 * @interface IConditionsMap
 */
export interface IConditionsMap {
  [field: string]: { [opKey: string]: any }; // ICondition | string | number | Array<string | number>;
}

export interface IConditionGroup {
  conditions: ICondition[];
  operator: 'AND' | 'OR';
}

export class Condition implements ICondition {
  constructor(
    public field: string,
    public op: string,
    public value: string) {}

  public and(cond: ICondition): ConditionGroup {
    return new ConditionGroup([this, cond], 'AND');
  }

  public or(cond: ICondition): ConditionGroup {
    return new ConditionGroup([this, cond], 'OR');
  }
}

/**
 * Represents a group of conditions combined by a specific logic operator
 */
export class ConditionGroup implements ICondition {
  constructor(
    public conditions: ICondition[],
    public operator: 'AND' | 'OR') {
    }

  public and(cond: ICondition): ConditionGroup {
    if (this.operator === 'AND')
      return new ConditionGroup([...this.conditions, cond], this.operator);

    return new ConditionGroup([cond, new ConditionGroup(this.conditions, this.operator)], 'AND');
  }

  public or(cond: ICondition): ConditionGroup {
    if (this.operator === 'OR')
      return new ConditionGroup([...this.conditions, cond], this.operator);

    return new ConditionGroup([cond, new ConditionGroup(this.conditions, this.operator)], 'OR');
  }
}
