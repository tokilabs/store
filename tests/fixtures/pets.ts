import { OrderDirection } from '@cashfarm/lang';
import { IPool } from 'mysql';

import {
    DateField, NumberField, StringField, Table,
    PK, TableName, TableClass, DtoClass,
    MysqlStore } from '@cashfarm/store';

import * as Sym from '@cashfarm/store/symbols';

export class Pet {
  public id: number;
  public breed: string;
  public birthday: Date;
  public gender: string;
  public species: string;
}

@TableName('purchases')
export class PurchaseTable extends Table {
  @PK()
  petId = new NumberField('pet_id');
  @PK()
  ownerId = new NumberField('owner_id');
  date = new DateField('date');
}

@TableName('pets')
export class PetTable extends Table {
  @PK()
  id = new NumberField('id');
  species = new StringField('species');
  breed = new StringField('breed');
  birthday = new DateField('birthday');
  gender = new StringField('gender');
}


@DtoClass(Pet)
@TableClass(PetTable)
export class PetStore extends MysqlStore<PetTable, Pet> {
  constructor() {
    super({} as IPool);
  }

  public allCats(): Promise<Array<Pet>> {
    return this.find(query =>
      query.where(p => p.species.equals('cat'))
    );
  }

  public oneYearPetsAndAllDogs(): Promise<Array<Pet>> {
    return this.find(q => q
      .select(f => [f.birthday, f.gender])
      .where(f => f.species.equals('cat'))
      .groupBy([this[Sym.TABLE]['species'], f => f.gender])
      .orderBy(f => f.breed, OrderDirection.Asc)
      .orderBy(f => f.birthday, OrderDirection.Desc)
      .limit(10)
    );
  }
}