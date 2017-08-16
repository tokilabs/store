import { format, prepareValue } from './util';

import { TABLE, TABLE_NAME } from '../../symbols';
import { Table, Field } from '../../mapping';

function placeholders(amount: number, str = '?') {
  const pArr: string[] = [];

  for (let i=0; i < amount; i++) {
    pArr.push(str);
  }

  return pArr.join(', ');
}

export class Insert<TTable extends Table, TFieldKey extends string & keyof TTable> {

  constructor(
    protected $table: TTable,
    public data: { [key in TFieldKey]?: any; },
    public excludeFields: TFieldKey[] = []) {
      Object.getOwnPropertyNames(data).forEach(f => {
        if (!this.$table[f])
          throw new Error(`Field ${f} does not exist in ${this.$table[TABLE_NAME]}`);
      });

      this.excludeFields = excludeFields || [];
    }

  public toString(): string {
    const cols: string[]  = [];
    const values: Array<string|number|boolean> = [];

    Object.getOwnPropertyNames(this.data).forEach( (f: TFieldKey) => {
      if (this.excludeFields.indexOf(f) < 0) {
        const mappedField = (<any>this.$table[f]) as Field;

        if (!mappedField)
          throw new Error(`Field ${mappedField} does not exist in table ${this.$table[TABLE_NAME]}`);

        cols.push(mappedField.selectExpr);
        values.push(prepareValue(this.data[f]));
      }
    });

    return format(
        `INSERT INTO ?? (${placeholders(cols.length, '??')}) VALUES (${placeholders(values.length)});`,
        [this.$table[TABLE_NAME], ...cols, ...values]);
  }
}
