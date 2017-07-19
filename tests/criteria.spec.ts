import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Delete, Insert, Query, Update } from '@cashfarm/store/mysql';
import { PK } from '@cashfarm/store/symbols';
import { Condition, ConditionGroup, Criteria, OP } from '../lib';
import { PetsTable } from './fixtures/pets';

let isFemale: Condition;
let isMale: Condition;
let notCat: Condition;

// tslint:disable:no-any
describe('Criteria class', () => {
  before( () => {
    isFemale = new Condition('gender', OP.EQUALS, 'FEMALE');
    isMale = new Condition('gender', OP.EQUALS, 'MALE');
    notCat = new Condition('species', OP.NOT_EQUAL, 'cat');
  });

  describe('Where method', () => {

    it('should accept a condition mapper', () => {
      const c = new Criteria(new PetsTable());

      c.where( t => t.gender.equals('FEMALE') );

      expect( (<any>c).conditions.conditions[0] ).to.deep.equal(isFemale);
    });

    it('should accept a field mapper and value', () => {
      const c = new Criteria(new PetsTable());

      c.where( t => t.gender, 'FEMALE');
      c.where( t => t.species, OP.NOT_EQUAL, 'cat');

      expect( (<any>c).conditions.conditions[0] ).to.deep.equal(isFemale);
      expect( (<any>c).conditions.conditions[1] ).to.deep.equal(notCat);
    });

    it('should accept a field name, operator and value', () => {
      const c = new Criteria(new PetsTable());

      c.where('gender', 'FEMALE');
      c.where('species', OP.NOT_EQUAL, 'cat');

      expect( (<any>c).conditions.conditions[0] ).to.deep.equal(isFemale);
      expect( (<any>c).conditions.conditions[1] ).to.deep.equal(notCat);
    });
  });

  describe('WhereAll method', () => {

    it('should accept a conditions map', () => {
      const c = new Criteria(new PetsTable());

      c.whereAll({
        gender: { '=': 'MALE' },
        species: { '!=': 'cat' }
      });

      const res = <ConditionGroup> (<any>c).conditions.conditions[0];

      expect( res.operator ).to.deep.equal('AND');
      expect( res.conditions[0] ).to.deep.equal(isMale);
      expect( res.conditions[1] ).to.deep.equal(notCat);
    });

    it('should accept an array of condition mappers', () => {
      const c = new Criteria(new PetsTable());

      c.whereAll([
        f => f.gender.equals('MALE'),
        f => f.species.notEqual('cat')
      ]);

      const res = <ConditionGroup> (<any>c).conditions.conditions[0];

      expect( res.operator ).to.deep.equal('AND');
      expect( res.conditions[0] ).to.deep.equal(isMale);
      expect( res.conditions[1] ).to.deep.equal(notCat);
    });

    it('should accept many condition mappers', () => {
      const c = new Criteria(new PetsTable());

      c.whereAll(
        f => f.gender.equals('MALE'),
        f => f.species.notEqual('cat')
      );

      const res = <ConditionGroup> (<any>c).conditions.conditions[0];

      expect( res.operator ).to.deep.equal('AND');
      expect( res.conditions[1] ).to.deep.equal(isMale);
      expect( res.conditions[0] ).to.deep.equal(notCat);
    });
  });

  describe('WhereAny method', () => {

    it('should accept a conditions map', () => {
      const c = new Criteria(new PetsTable());

      c.whereAny({
        gender: { '=': 'MALE' },
        species: { '!=': 'cat' }
      });

      const res = <ConditionGroup> (<any>c).conditions.conditions[0];

      expect( res.operator ).to.deep.equal('OR');
      expect( res.conditions[0] ).to.deep.equal(isMale);
      expect( res.conditions[1] ).to.deep.equal(notCat);
    });

    it('should accept an array of condition mappers', () => {
      const c = new Criteria(new PetsTable());

      c.whereAny([
        f => f.gender.equals('MALE'),
        f => f.species.notEqual('cat')
      ]);

      const res = <ConditionGroup> (<any>c).conditions.conditions[0];

      expect( res.operator ).to.deep.equal('OR');
      expect( res.conditions[0] ).to.deep.equal(isMale);
      expect( res.conditions[1] ).to.deep.equal(notCat);
    });

    it('should accept many condition mappers', () => {
      const c = new Criteria(new PetsTable());

      c.whereAny(
        f => f.gender.equals('MALE'),
        f => f.species.notEqual('cat')
      );

      const res = <ConditionGroup> (<any>c).conditions.conditions[0];

      expect( res.operator ).to.deep.equal('OR');
      expect( res.conditions[1] ).to.deep.equal(isMale);
      expect( res.conditions[0] ).to.deep.equal(notCat);
    });
  });

});
