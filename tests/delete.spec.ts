import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Delete, Insert, Query, Update } from '@cashfarm/store/mysql';
import { PK } from '@cashfarm/store/symbols';
import { Condition, ConditionGroup, Criteria, OP } from '../lib';
import { PetsTable } from './fixtures/pets';

describe('Delete class', () => {

  it('should generate proper deletes', () => {
    const del = new Delete(new PetsTable()).where(f => f.id.equals(123));

    expect(del.toString()).to.be.equal('DELETE FROM `pets` WHERE `id` = 123;');
  });

});
