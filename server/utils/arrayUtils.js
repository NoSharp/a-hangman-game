
/**
 * Converts an array to an object
 * Where the object's keys are the values
 * in the array and the values of said keys
 * are the arrays indexes.
 *
 * @param {Array} array the array to convert into an object
 *
 * @returns {Object}
 */
export function invertArray(array) {
  const inverted = {};

  for (let idx = 0; idx < array.length; idx++) {
    inverted[array[idx]] = idx;
  }

  return inverted;
}
