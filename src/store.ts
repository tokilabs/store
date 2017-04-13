export interface IStore {}

export class Store implements IStore {
  public static TABLE = Symbol('TABLE');
  public static DTO = Symbol('DTO');
}

export default Store;
