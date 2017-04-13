import * as mysql from 'mysql';
import { flatten } from 'lodash';

import {ConditionGroup, Condition, OP} from '../../condition';
import { CriteriaEnabled } from '../../criteria';
import {Table} from '../../mapping';

export abstract class Whereable<TTable extends Table, TSubclass extends Whereable<TTable, TSubclass>> extends CriteriaEnabled<TTable, TSubclass> {

  private getOperatorTemplate(op: string): string {
    if ([OP.BETWEEN, OP.NOT_BETWEEN].indexOf(op) >= 0)
      return `?? ${op} ? AND ?`;

    if ([OP.IN, OP.NOT_IN].indexOf(op) >= 0)
      return `?? ${op} (?)`;

    return `?? ${op} ?`;
  }

  protected buildGroupCondition(gp: ConditionGroup): string {
    return '(' + flatten(gp.conditions.map<string>( (curr) => {
      let c: Condition;

      if (curr instanceof ConditionGroup) {
        return this.buildGroupCondition(curr);
      }
      else
        c = curr as Condition;

      return mysql.format(this.getOperatorTemplate(c.op), [c.field, c.value]);
    })).join(` ${gp.operator} `) + ')';
  }

  protected buildWhere(): string {
    if (this.conditions) {
      const where: string[] = [];

      this.conditions.conditions.forEach(c => {
        if (c instanceof ConditionGroup) {
          where.push(this.buildGroupCondition(c));
        }
        else if (c instanceof Condition) {
          where.push(mysql.format(this.getOperatorTemplate(c.op), [c.field, c.value]));
        }
      });

      return 'WHERE ' + where.join(` ${this.conditions.operator} `);
    }

    return '';
  }
}
