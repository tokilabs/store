import { expect } from 'chai';
import { format as formatQuery } from 'mysql';

import { Delete, Insert, Query, Update } from '@cashfarm/store/mysql';
import { Pet, PetsTable, PetStore } from './fixtures/pets';

describe('Store class', () => {
  it('should be able to create new objects', async () => {
    const pet = new Pet();
    const birth = new Date();
    birth.setMilliseconds(0);

    // tslint:disable-next-line:insecure-random
    pet.id = Math.floor(Math.random() * 1000);
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
});
