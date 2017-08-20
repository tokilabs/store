import * as MySQL from './util';

import { Table } from '../../mapping';
import { TABLE_NAME } from '../../symbols';
import { Whereable } from './whereable';

export class Delete<TTable extends Table> extends Whereable<TTable, Delete<TTable>> {

  constructor(table: TTable) {
    super(table);
  }

  public toString(): string {
    return MySQL.format(
      `DELETE FROM ?? ${this.buildWhere()};`,
      [this.$table[TABLE_NAME]]);
  }
}
