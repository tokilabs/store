import { OrderDirection } from '@cashfarm/lang';
import { createPool } from 'mysql';

import {
    DateField, DtoClass, MysqlStore, NumberField,
    PK, StringField, Table, TableClass,
    TableName } from '@cashfarm/store';

import * as Sym from '@cashfarm/store/symbols';

import { IOkResult, QueryBuilder } from '@cashfarm/store';
import { IQuery } from '@cashfarm/store/dialects';
import { Client, Pet, Sale } from './dtos';
import { ClientsTable, PetsTable, SalesTable } from './mapping';
import { Symbols } from "@cashfarm/store";

const pool = createPool({
  connectionLimit: 1,
  host     : 'localhost',
  user     : 'root',
  password : 'sbrubles',
  database : 'petstore'
});

@DtoClass(Pet)
@TableClass(PetsTable)
export class PetStore extends MysqlStore<PetsTable, Pet> {
  constructor() {
    super(pool);
  }

  public create(pet: Pet): Promise<Pet> {
    return super.create(pet);
  }

  public findOne(query: IQuery<PetsTable>): Promise<Pet>;
  public findOne(query: QueryBuilder<PetsTable>): Promise<Pet>;
  public findOne(query: IQuery<PetsTable> | QueryBuilder<PetsTable>): Promise<Pet> {
    return super.findOne(<any> query);
  }

  public update(pet: Pet): Promise<IOkResult> {
    return super.update(pet, q => q.where(p => p.id.equals(pet.id)));
  }

  public allCats(): Promise<Array<Pet>> {
    return this.find(query =>
      query.where(p => p.species.equals('cat'))
    );
  }

  public deleteAllPets(): Promise<any> {
    return this.runCommand(`truncate ${this[Symbols.TABLE][Symbols.TABLE_NAME]};`);
  }

  public oneYearPetsAndAllDogs(): Promise<Array<Pet>> {
    return this.find(q => q
      .select(f => [f.birthday, f.gender, f.breed])
      .where(f => f.species.equals(''))
      .groupBy([new PetsTable().species, f => f.gender])
      .orderBy(f => f.breed, OrderDirection.Asc)
      .orderBy(f => f.birthday, OrderDirection.Desc)
      .limit(10)
    );
  }

  public petsCount() {
    return super.compute<number>('COUNT(id)', 0);
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
