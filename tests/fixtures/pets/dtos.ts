export class Pet {
  public id: number;
  public breed: string;
  public birthday: Date;
  public gender: 'MALE' | 'FEMALE';
  public species: string;
}

export class Client {
  public id: number;
  public name: string;
}

export class Sale {
  public petId: number;
  public clientId: number;
  public total: number;
  public createdAt: Date;
}