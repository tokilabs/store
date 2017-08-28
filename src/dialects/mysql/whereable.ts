import { flatten } from 'lodash';

import { Condition, ConditionGroup, OP } from '../../condition';
import { CriteriaEnabled } from '../../criteria';
import { Table } from '../../mapping';
import { format, prepareValue } from './util';

export abstract class Whereable<TTable extends Table, TSubclass extends Whereable<TTable, TSubclass>>
                      extends CriteriaEnabled<TTable, TSubclass> {

  protected buildGroupCondition(gp: ConditionGroup): string {
    return `(${
      flatten(gp.conditions.map<string>( (curr) => {
        let c: Condition;

        if (curr instanceof ConditionGroup) {
          return this.buildGroupCondition(curr);
        }
        else
          c = <Condition> curr;

        return format(this.getOperatorTemplate(c.op), [c.field, prepareValue(c.value)]);
      }))
      .join(` ${gp.operator} `)})`;
  }

  protected buildWhere(): string {
    if (this.conditions.conditions.length > 0) {
      const where: string[] = [];

      this.conditions.conditions.forEach(c => {
        if (c instanceof ConditionGroup) {
          where.push(this.buildGroupCondition(c));
        }
        else if (c instanceof Condition) {
          where.push(format(this.getOperatorTemplate(c.op), [c.field, prepareValue(c.value)]));
        }
      });

      return `WHERE ${where.join(` ${this.conditions.operator} `)}`;
    }

    return '';
  }

  private getOperatorTemplate(op: string): string {
    if ([OP.BETWEEN, OP.NOT_BETWEEN].indexOf(op) >= 0)
      return `?? ${op} ? AND ?`;

    if ([OP.IN, OP.NOT_IN].indexOf(op) >= 0)
      return `?? ${op} (?)`;

    return `?? ${op} ?`;
  }
}
