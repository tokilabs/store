import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Condition, ConditionGroup, Criteria, OP } from '@cashfarm/store';
import { Delete, Insert, Query, Update } from '@cashfarm/store/mysql';
import { PK } from '@cashfarm/store/symbols';
import { PetsTable } from './fixtures/pets';

let isFemale: Condition;
let isMale: Condition;
let notCat: Condition;

// tslint:disable:no-any
describe('Query class', () => {
  before( () => {
    isFemale = new Condition('gender', OP.EQUALS, 'FEMALE');
    isMale = new Condition('gender', OP.EQUALS, 'MALE');
    notCat = new Condition('species', OP.NOT_EQUAL, 'cat');
  });

  it('should generate complex Selects', () => {

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

    expect(query.toString()).to.equals(
      'SELECT `birthday`, `breed`, `gender`, `id`, `species` ' +
      'FROM `pets` ' +
      "WHERE (`birthday` < '2016-02-01 02:00:00' AND `gender` = 'male') " +
        'AND `id` IN (2, 4, 6, 8) ' +
        "AND (`species` = 'dog' OR `species` = 'cat');");
  });
});
