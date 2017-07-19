import * as ex from './exceptions';
import { Table } from './mapping';
import { Store } from './store';
import * as Sym from './symbols';

/**
 * Primary Key (PK) class Decorator
 *
 * Defines the name of the table in the database for this mapping class.
 *
 * @param constructor The table class constructor
 */
export function PK(): (target: Table, propertyKey: string) => void;
export function PK(property: string | Array<string>): <T extends typeof Table & {new(): Table}>(tableClass: T) => T;
export function PK(property?: string | Array<string>) {
  if (property === undefined) {
    return (target: Table, propertyKey: string) => {
      target[Sym.PK] = target[Sym.PK] || [];
      target.constructor[Sym.PK] = target.constructor[Sym.PK] || [];

      target[Sym.PK].push(propertyKey);
      target.constructor[Sym.PK].push(propertyKey);
    };
  }

  return <T extends typeof Table & {new(): Table}>(tableClass: T): T => {
    const table = new tableClass();

    if (typeof property === 'string') {
      if (table[Sym.FIELDS][property] === undefined)
        throw new ex.PrimeryKeyFieldNotDefined(tableClass.name, property);
    }
    else {
      property.forEach(p => {
        if (table[Sym.FIELDS][p] === undefined)
          throw new ex.PrimeryKeyFieldNotDefined(tableClass.name, p);
      });
    }

    tableClass[Sym.PK] = property;
    tableClass.prototype[Sym.PK] = property;

    return tableClass;
  };
}

/**
 * TableName class Decorator
 *
 * Defines the name of the table in the database for this mapping class.
 *
 * @param constructor The table class constructor
 */
export function TableName(tableName: string) {
  return <T extends typeof Table>(constructr: T): T => {
    constructr[Sym.TABLE_NAME] = tableName;
    constructr.prototype[Sym.TABLE_NAME] = tableName;

    return constructr;
  };
}

/**
 * TableClass class Decorator (for Store classes)
 *
 * Defines the class that maps the db table used by this store.
 *
 * @param tableClass The table class
 */
export function TableClass(tableClass: typeof Table) {
  return <T extends Store & {new(): Store}>(constructr: T): T => {
    constructr[Store.TABLE] = tableClass;
    constructr.prototype[Store.TABLE] = tableClass;

    return constructr;
  };
}

/**
 * DtoClass class Decorator (for Store classes)
 *
 * Defines the class to be used as the DTO for the store.
 *
 * @param constructor The table class constructor
 */
export function DtoClass(dtoClass: {new (): object}) {
  return <T extends typeof Store & {new(): Store}>(constructr: T): T => {
    constructr[Store.DTO] = dtoClass;
    constructr.prototype[Store.DTO] = dtoClass;

    return constructr;
  };
}
