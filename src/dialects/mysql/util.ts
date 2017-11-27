import { format, escape } from 'mysql';
export { format, escape } from 'mysql';

/**
 * Prepares value (when needed) to be passed to mysql's format
 *
 * @export
 * @param {(string|number|boolean|Date|Object)} value
 * @returns {(string|number|boolean|Object)}
 */
export function prepareValue(value: string|number|boolean|Date): string|number|boolean {
  const twoDigits = (n: number) => ("0" + n).slice(-2);

  if (value instanceof Date) {
    return value.getFullYear() + "-" +
      twoDigits(1 + value.getMonth()) + "-" +
      twoDigits(value.getDate()) + " " +
      twoDigits(value.getHours()) + ":" +
      twoDigits(value.getMinutes()) + ":" +
      twoDigits(value.getSeconds());
  }

  return value;
}
