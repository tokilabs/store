import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Condition, ConditionGroup, Criteria, OP } from '@cashfarm/store';
import { Delete, Insert, Query, Update } from '@cashfarm/store/mysql';
import { PK } from '@cashfarm/store/symbols';
import { PetsTable } from './fixtures/pets';

describe('Insert class', () => {

  it('should generate proper inserts', () => {
    const data = {
      species: 'cat',
      breed: 'siamese',
      birthday: new Date(2017, 1, 13),
      gender: 'male'
    };

    const ins = new Insert(new PetsTable(), data);

    expect(ins.toString()).to.be.equal(
      'INSERT INTO `pets` (`species`, `breed`, `birthday`, `gender`) ' +
      "VALUES ('cat', 'siamese', '2017-02-13 00:00:00', 'male');");
  });
});
