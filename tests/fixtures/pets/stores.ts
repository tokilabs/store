import { OrderDirection } from '@cashfarm/lang';
import { createPool } from 'mysql';

import {
    DateField, DtoClass, MysqlStore, NumberField,
    PK, StringField, Table, TableClass,
    TableName } from '@cashfarm/store';

import * as Sym from '@cashfarm/store/symbols';

import { Client, Pet, Sale } from './dtos';
import { ClientsTable, PetsTable, SalesTable } from './mapping';

const pool = createPool({
  connectionLimit: 1,
  host     : "localhost",
  user     : "root",
  password : "sbrubles",
  database : "petstore"
});

@DtoClass(Pet)
@TableClass(PetsTable)
export class PetStore extends MysqlStore<PetsTable, Pet> {
  constructor() {
    super(pool);
  }

  public allCats(): Promise<Array<Pet>> {
    return this.find(query =>
      query.where(p => p.species.equals('cat'))
    );
  }

  public oneYearPetsAndAllDogs(): Promise<Array<Pet>> {
    return this.find(q => q
      .select(f => [f.birthday, f.gender, f.breed])
      .where(f => f.species.equals(''))
      .groupBy([this[Sym.TABLE]['species'], f => f.gender])
      .orderBy(f => f.breed, OrderDirection.Asc)
      .orderBy(f => f.birthday, OrderDirection.Desc)
      .limit(10)
    );
  }
}

@DtoClass(Client)
@TableClass(ClientsTable)
export class ClientPetStore extends MysqlStore<ClientsTable, Client> {
  constructor() {
    super(pool);
  }
}

@DtoClass(Sale)
@TableClass(SalesTable)
export class SaleStore extends MysqlStore<SalesTable, Sale> {
  constructor() {
    super(pool);
  }
}