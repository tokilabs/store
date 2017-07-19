import { OrderDirection } from '@cashfarm/lang';
import { createPool } from 'mysql';

import {
    DateField, DtoClass, MysqlStore, NumberField,
    PK, StringField, Table, TableClass,
    TableName } from '@cashfarm/store';

import * as Sym from '@cashfarm/store/symbols';

@TableName('pets')
export class PetsTable extends Table {
  @PK()
  id = new NumberField('id');
  species = new StringField('species');
  breed = new StringField('breed');
  birthday = new DateField('birthday');
  gender = new StringField('gender');
}

@TableName('clients')
export class ClientsTable extends Table {
  @PK()
  id = new NumberField('id');
  @PK()
  name = new StringField('name');
}

@TableName('sales')
export class SalesTable extends Table {
  @PK()
  petId = new NumberField('petId');
  @PK()
  ownerId = new NumberField('clientId');
  total = new NumberField('total');
  createdAt = new DateField('createdAt');
}
