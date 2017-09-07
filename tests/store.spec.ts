import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Delete, Insert, Query, Update } from '@cashfarm/store/mysql';
import { Pet, PetsTable, PetStore } from './fixtures/pets';

describe('Store class', () => {

  it('should be able to run an arbitrary SQL command', async () => {
    const store = new PetStore();

    return store.deleteAllPets().then(result => {
      expect(result).to.not.be.null;
    });
  });

  it('should be able to create new objects', async () => {
    const pet = new Pet();
    const birth = new Date();
    birth.setMilliseconds(0);

    // tslint:disable-next-line:insecure-random
    pet.id = Math.floor(Math.random() * 999999999);
    pet.birthday = birth;
    pet.species = 'cat';
    pet.breed = 'siamese';
    pet.gender = 'FEMALE';

    const store = new PetStore();

    return store.create(pet)
      .then(saved => {
        expect(saved).to.deep.eq(pet);
      });
  });

  it('should be able to update existing objects', async () => {
    const store = new PetStore();
    const today = new Date();
    today.setMilliseconds(0);

    return store.findOne(q => q)
      .then(pet => {
        pet.birthday = today;

        return store.update(pet)
          .then(() => store.findOne(q => q.where(p => p.id.equals(pet.id))))
          .then(saved => {
            expect(saved).to.deep.eq(pet);
          });
      });
  });

  it('should be able to compute scalar results', async () => {
    const store = new PetStore();

    return store.petsCount().then(count => {
      expect(count).to.be.a('number');
      expect(count).to.be.greaterThan(0);
    });
  });
});
