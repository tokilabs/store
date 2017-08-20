import * as util from './util';

import { Field, Table } from '../../mapping';
import { FIELDS, PK, TABLE, TABLE_NAME } from '../../symbols';
import { Whereable } from './whereable';

export class Update<TTable extends Table, TFieldKeys extends string & keyof TTable>
                extends Whereable<TTable, Update<TTable, TFieldKeys>> {

  public excludeFields: TFieldKeys[];
  public ignoreExtraProperties: boolean;

  constructor(
    table: TTable,
    dto: { [key in TFieldKeys]?: any; },
    ignoreExtraProperties?: boolean
  );
  constructor(
    table: TTable,
    dto: { [key in TFieldKeys]?: any; },
    excludeFields?: TFieldKeys[]
  );
  constructor(
    table: TTable,
    public dto: { [key in TFieldKeys]?: any; },
    excludeOrIgnore?: TFieldKeys[] | boolean,
    ignoreExtraProperties?: boolean
  ) {
    super(table);

    if (Array.isArray(excludeOrIgnore)) {
      this.excludeFields = excludeOrIgnore || [];
      this.ignoreExtraProperties = ignoreExtraProperties;
    }
    else {
      this.excludeFields = [];

      this.ignoreExtraProperties = (typeof excludeOrIgnore === 'boolean') && excludeOrIgnore;
    }
  }

  public toString(): string {
    const cols: string[]  = [];
    const values: Array<string|number|boolean> = [];

    Object.getOwnPropertyNames(this.dto).forEach( (f: TFieldKeys) => {
      if (this.excludeFields.indexOf(f) < 0) {
        const mappedField = <Field> (<any>this.$table[f]);

        if (!mappedField && !this.ignoreExtraProperties)
          throw new Error(`No mapping defined in ${this.$table.constructor.name} for DTO property ${f}`);

        cols.push('?? = ?');
        values.push(mappedField.selectExpr);
        values.push(util.prepareValue(this.dto[f]));
      }
    });

    return util.format(
        `UPDATE ?? SET ${cols.join(', ')} ${this.buildWhere()};`,
        [this.$table[TABLE_NAME], ...values]);
  }
}
