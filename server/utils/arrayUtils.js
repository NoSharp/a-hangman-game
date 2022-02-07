
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
export function invertArray(array){

    let inverted = {};

    for(const arrayIdx in array){
        inverted[array[arrayIdx]] = arrayIdx;
    }

    return inverted;
}