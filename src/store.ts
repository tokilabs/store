import * as Sym from './symbols';

export interface IStore {}

export class Store implements IStore {
  public static TABLE = Sym.TABLE;
  public static DTO = Sym.DTO;
}

export default Store;
