export interface IOkResult {
  fieldCount: number;
  affectedRows: number;
  /**
   * "changedRows" differs from "affectedRows" in that it does not count
   * updated rows whose values were not changed.
   */
  changedRows: number;
  insertId: any;
  serverStatus?: any;
  warningCount?: number;
  message: string;
}
