import { injectable } from 'inversify';
import * as Sym from './symbols';

// tslint:disable-next-line:no-empty-interface
export interface IStore {}

@injectable()
// tslint:disable-next-line:no-stateless-class
export class Store implements IStore {
  public static TABLE = Sym.TABLE;
  public static DTO = Sym.DTO;
}
