# CashFarm Store

## Goal

To have a **simple** to use library for managing the Read Models. The kind we use when we want
to store projections of events used in CQRS/ES arquitectures.

The goal of this library is to facilitate **simple** queries against a relational database.
It was designed from start with denormalized tables in mind.

## API

### Store

The Store class represents a set of objects that can be stored and queried. It's NOT your entity
repository (as in a DDD).

### Table

Table child classes is how you map a DB table. To create a store you'll have to extend the Table class,
define the database table name, fields and primary key.

### Criteria

A class which reads the table definition and allows you to construct queries against it.

## Example

```typescript

export class Pet {
  public id: number;
  public breed: string;
  public birthday: Date;
  public gender: string;
  public species: string;
}

@TableName('pets')
export class PetsTable extends Table {
  @PK()
  id = new NumberField('id');
  species = new StringField('species');
  breed = new StringField('breed');
  birthday = new DateField('birthday');
  gender = new StringField('gender');
}

@DtoClass(Pet)
@TableClass(PetsTable)
export class PetStore extends MysqlStore<PetsTable, Pet> {
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

const query = new Query(new PetsTable())
      .whereAll(
        f => f.gender.equals('male'),
        f => f.birthday.before(new Date(2016, 1, 1, 2, 0, 0))
      )
      .where(f => f.id, [2, 4, 6, 8])
      .whereAny(
        f => f.species.equals('cat'),
        f => f.species.equals('dog')
      );
```

## Development

1. Install yarn if you didn't yet (`npm i -g yarn`)
2. Clone the repository
3. From the root of the project run `yarn setup:dev` (or `npm run setup:dev`)

Profit!

To continuously compile and run tests simply run `yarn test:watch`
