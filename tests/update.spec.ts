import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Condition, ConditionGroup, Criteria, OP } from '../lib';
import { PetsTable } from './fixtures/pets';
import { Query, Insert, Update, Delete } from '@cashfarm/store/mysql';
import { PK } from '@cashfarm/store/symbols';

describe('Update class', () => {

  it('should generate proper updates', () => {
    const data = {
      species: 'cat',
      breed: 'siamese',
      birthday: new Date(2017, 1, 13),
      gender: 'male'
    };

    const update = new Update(new PetsTable(), data)
      .where(f => f.id.equals(123));

    expect(update).to.not.be.empty;
    expect(update.toString()).to.be.equal(
      'UPDATE `pets` SET ' +
      "`species` = 'cat', `breed` = 'siamese', `birthday` = '2017-02-13 00:00:00', `gender` = 'male' " +
      'WHERE `id` = 123;');
  });

});