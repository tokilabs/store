import * as util from './util';

import { Field, Table } from '../../mapping';
import { FIELDS, PK, TABLE, TABLE_NAME } from '../../symbols';
import { Whereable } from './whereable';

export class Update<TTable extends Table, TFieldKey extends string & keyof TTable>
                extends Whereable<TTable, Update<TTable, TFieldKey>> {
  constructor(
    protected $table: TTable,
    public data: { [key in TFieldKey]?: any; },
    public excludeFields: TFieldKey[] = []) {
      super($table);

      this.excludeFields = excludeFields || [];
    }

  public toString(): string {
    const cols: string[]  = [];
    const values: Array<string|number|boolean> = [];

    Object.getOwnPropertyNames(this.data).forEach( (f: TFieldKey) => {
      if (this.excludeFields.indexOf(f) < 0) {
        const mappedField = <Field> (<any>this.$table[f]);
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
