import { ICondition } from './condition';
import { Criteria } from './criteria';
import { IQuery } from './dialects/iQuery';
import { Field, Table } from './mapping';

/**
 * A function which receives a `Criteria<TTable>`, modifies it and then returns it.
 */
export type CriteriaBuilder<TTable extends Table> = (c: Criteria<TTable>) => Criteria<TTable>;
export type CriteriaOrBuilder<TTable extends Table> = Criteria<TTable> | CriteriaBuilder<TTable>;

/**
 * A function which receives a `Query<TTable>`, modifies it and then returns it.
 */
export type QueryBuilder<TTable extends Table> = (query: IQuery<TTable>) => IQuery<TTable>;

/**
 * Either an `IQuery<TTable>` or a `QueryBuilder<TTable>`.
 * `QueryBuilder<TTable>` is a function which receives a query, modifies it and then returns it.
 */
export type QueryOrBuilder<TTable extends Table> = IQuery<TTable> | QueryBuilder<TTable>;

/**
 * A function which receives a `Table` and returns an ICondition.
 */
export type ConditionBuilder<TTable> = (mapper: TTable) => ICondition;
export type ConditionOrMapper<TTable> = ICondition | ConditionBuilder<TTable>;

/**
 * A function which receives a `TTable` and returns a `Field`
 */
export type FieldSelector<TTable> = (mapper: TTable) => Field;
export type FieldOrSelector<TTable> = Field | FieldSelector<TTable>;
