export class PrimeryKeyFieldNotDefined extends Error {
  constructor(tableClass: string, pkName: string) {
    super(`The primary key ${pkName} was no not defined in the ${tableClass}.fields property`);
  }
}
