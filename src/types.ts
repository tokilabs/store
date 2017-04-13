import {ICondition} from './condition';
import {Field, Table} from './mapping';
import { Criteria } from './criteria';
import { IQuery } from './dialects/iQuery';

export type CriteriaBuilder<TTable extends Table> = (c: Criteria<TTable>) => Criteria<TTable>;
export type CriteriaOrBuilder<TTable extends Table> = Criteria<TTable> | CriteriaBuilder<TTable>;

export type QueryBuilder<TTable extends Table> = (query: IQuery<TTable>) => IQuery<TTable>;
export type QueryOrBuilder<TTable extends Table> = IQuery<TTable> | QueryBuilder<TTable>;

export type ConditionBuilder<TTable> = (mapper: TTable) => ICondition;
export type ConditionOrMapper<TTable> = ICondition | ConditionBuilder<TTable>;

export type FieldSelector<TTable> = (mapper: TTable) => Field;
export type FieldOrSelector<TTable> = Field | FieldSelector<TTable>;
