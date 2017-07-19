import * as util from './util';

import { Field, Table } from '../../mapping';
import { Whereable } from './whereable';
import { FIELDS, PK, TABLE, TABLE_NAME } from '../../symbols';

export class Update<TTable extends Table, TFieldKey extends string & keyof TTable>
                extends Whereable<TTable, Update<TTable, TFieldKey>> {
  constructor(
    protected $table: TTable,
    public data: { [key in TFieldKey]?: any; },
    public excludeFields: TFieldKey[] = []) {
      super($table);
    }

  public toString(): string {
    const cols: string[]  = [];
    const values: Array<string|number|boolean> = [];

    Object.getOwnPropertyNames(this.data).forEach( (f: TFieldKey) => {
      if (this.excludeFields.indexOf(f) < 0) {
        const mappedField = (<any>this.$table[f]) as Field;
        cols.push('?? = ?');
        values.push(mappedField.selectExpr);
        values.push(util.prepareValue(this.data[f]));
      }
    });

    return util.format(
        `UPDATE ?? SET ${cols.join(', ')} ${this.buildWhere()};`,
        [this.$table[TABLE_NAME], ...values]);
  }
}
