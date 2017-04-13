import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { PetTable } from './fixtures/pets';
import { Query, Insert } from '@cashfarm/store/mysql';

describe('Criteria class', () => {
  it('should allow combining ANDs and ORs', () => {

    const query = new Query(new PetTable())
      .whereAll(
        f => f.gender.equals('male'),
        f => f.birthday.before(new Date(2016, 1))
      )
      .where(f => f.id, [2, 4, 6, 8])
      .whereAny(
        f => f.species.equals('cat'),
        f => f.species.equals('dog')
      );

    expect(query.toString()).to.not.be.empty;
    expect(query.toString().replace(/\s+/g, ' ').trim()).to.be.eql(
      'SELECT `birthday`, `breed`, `gender`, `id`, `species` ' +
      'FROM `pets` ' +
      "WHERE (`birthday` < '2016-02-01 02:00:00' AND `gender` = 'male') " +
        "AND `id` IN (2, 4, 6, 8) " +
        "AND (`species` = 'dog' OR `species` = 'cat')");
  });

  it('should generate proper inserts', () => {
    const data = {
      species: 'cat',
      breed: 'siamese',
      birthday: new Date(2017, 1, 13),
      gender: 'male'
    };
    const ins = new Insert(new PetTable(), data);

    console.log(ins.toString());
    expect(ins).to.not.be.empty;
  //   expect(crit.toQuery().replace(/\s+/g, ' ').trim()).to.be.equal(
  //     'SELECT * FROM DummyTable ' +
  //     'WHERE (name = \'football\' AND avatar = NULL) ' +
  //     'AND id IN (2,4,6,8) ' +
  //     'AND (rating BETWEEN 1 AND 3 OR rating BETWEEN 7 AND 10)');
  });
});