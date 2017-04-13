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
  $eq?: any;
  $ne?: any;
  $gt?: any;
  $gte?: any;
  $lt?: any;
  $lte?: any;
  $in?: Array<any>;
  $notIn?: Array<any>;
  $like?: string;
  $notLike?: string;
  $isNull?: null;
  $between?: Array<number>;
  $notBetween?: Array<number>;

  and(cond: ICondition): ICondition;
  or(cond: ICondition): ICondition;

  /**
   * Value is equal to a column, with dialect specific column identifiers.
   *
   * e.g.: = `table`.`column_name` (mysql)
   */
  $col?: string;

  // For PostGres

  // /**
  //  * [PG ONLY] Case insensitive version of "LIKE" operator
  //  * @example ILIKE '%exam'
  //  */
  // $iLike: string;

  // /**
  //  * [PG ONLY] Case insensitive version of "NOT LIKE" operator
  //  * @example NOT ILIKE '%exam'
  //  */
  // $notILike: string;

  // /**
  //  * [PG ONLY] Array overlap operator
  //  * @example && [2, 4]
  //  */
  // $overlap: Array<number>;

  // /**
  //  * [PG ONLY] Array contains operator
  //  * @example @> [2, 4]
  //  */
  // $contains: Array<number>;

  // /**
  //  * [PG ONLY] Array contained operator
  //  * @example <@ [2, 4]
  //  */
  // $contained: Array<number>;

  // /**
  //  * [PG ONLY] Any Array operator
  //  * @example ANY ARRAY[2, 4]::INTEGER
  //  */
  // $any: Array<number>;
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
  [field: string]: { [opKey: string]: any };// ICondition | string | number | Array<string | number>;
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
    if (this.operator == 'AND')
      return new ConditionGroup([...this.conditions, cond], this.operator);

    return new ConditionGroup([cond, new ConditionGroup(this.conditions, this.operator)], 'AND');
  }

  public or(cond: ICondition): ConditionGroup {
    if (this.operator == 'OR')
      return new ConditionGroup([...this.conditions, cond], this.operator);

    return new ConditionGroup([cond, new ConditionGroup(this.conditions, this.operator)], 'OR');
  }
}
