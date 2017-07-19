/**
 * Returns the name of an object's type.
 *
 * If the input is undefined, returns 'Undefined'.
 * If the input is null, returns 'Null'.
 * If the input is a boolean, returns 'Boolean'.
 * If the input is a number, returns 'Number'.
 * If the input is a string, returns 'String'.
 * If the input is a named function or a class constructor, returns 'Function'.
 * If the input is an anonymous function, returns 'AnonymousFunction'.
 * If the input is an arrow function, returns 'ArrowFunction'.
 * If the input is a class instance, returns 'Object'.
 *
 * @param {Object} object an object
 * @return {String} the name of the object's class
 * @see <a href='https://stackoverflow.com/a/332429/14731'>https://stackoverflow.com/a/332429/14731</a>
 * @see getFunctionName
 * @see getObjectClass
 */
export function getTypeName(object: any) {
  const objectToString = Object.prototype.toString.call(object).slice(8, -1);
  if (objectToString === 'Function') {
    const instanceToString = object.toString();

    if (instanceToString.indexOf(' => ') !== -1)
      return 'ArrowFunction';

    const getFunctionName = /^function ([^(]+)\(/;
    const match = instanceToString.match(getFunctionName);

    if (match === null)
      return 'AnonymousFunction';

    return 'Function';
  }
  // Built-in types (e.g. String) or class instances
  return objectToString;
}

/**
 * @param {Object} object an object
 * @return {String} the name of the object's class
 * @throws {TypeError} if {@code object} is not an Object
 * @see getTypeName
 */
export function getObjectClass(object: Object) {
  const getNameRex = /^(function|class) ([^({\r\n\s]+)/;

  const result = object.constructor.toString().match(getNameRex)[2];

  if (result === 'Function') {
    throw TypeError(`object must be an Object.\n Actual: ${getTypeName(object)}`);
  }

  return result;
}
