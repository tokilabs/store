import * as mysql from 'mysql';

import { TABLE_NAME } from '../../symbols';
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
    }

  public toString(): string {
    const cols: string[]  = [];
    const values: string[] = [];

    Object.getOwnPropertyNames(this.data).forEach( (f: TFieldKey) => {
      if (this.excludeFields.indexOf(f) < 0) {
        const mappedField = (<any>this.$table[f]) as Field;
        cols.push(mappedField.selectExpr);
        values.push(this.data[mappedField.alias]);
      }
    });

    return mysql.format(
        `INSERT INTO ?? (${placeholders(cols.length, '??')}) VALUES (${placeholders(cols.length)})`,
        [this.$table[TABLE_NAME], ...cols, ...values]);
  }
}
