import * as Sym from './symbols';
import { Table } from './mapping';
import { Store } from './store';
import * as ex from './exceptions';

/**
 *
 */
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
  if (typeof property === 'undefined') {
    return function (target: Table, propertyKey: string) {
      target[Sym.PK] = target[Sym.PK] || [];
      target.constructor[Sym.PK] = target.constructor[Sym.PK] || [];

      target[Sym.PK].push(propertyKey);
      target.constructor[Sym.PK].push(propertyKey);
    };
  }

  return function<T extends typeof Table & {new(): Table}>(tableClass: T): T {
    const table = new tableClass();

    if (typeof property === 'string') {
      if (typeof table[Sym.FIELDS][property] === 'undefined')
        throw new ex.PrimeryKeyFieldNotDefined(tableClass.name, property);
    }
    else {
      property.forEach(p => {
        if (typeof table[Sym.FIELDS][p] === 'undefined')
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
  return function<T extends typeof Table>(constructor: T): T {
    constructor[Sym.TABLE_NAME] = tableName;
    constructor.prototype[Sym.TABLE_NAME] = tableName;
    return constructor;
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
  return function<T extends Store & {new(): Store}>(constructor: T): T {
    constructor[Store.TABLE] = tableClass;
    constructor.prototype[Store.TABLE] = tableClass;
    return constructor;
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
  return function<T extends typeof Store & {new(): Store}>(constructor: T): T {
    constructor[Store.DTO] = dtoClass;
    constructor.prototype[Store.DTO] = dtoClass;
    return constructor;
  };
}
