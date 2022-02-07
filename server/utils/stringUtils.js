
/**
 * Returns a list of indexes for a given string.
 * 
 * @param {string} char 
 * @param {string} word 
 * @returns {Array.<number>} The array of indexes
*/
export function getCharacterIndexes(char, word, ignorCase){
    char = char.toUpperCase();
    word = word.toUpperCase();
    let indexes = [];
    for(let idx = 0; idx < word.length; idx++){
        if(word.charAt(idx) === char){
            indexes.push(idx);
        }
    }
    return indexes;
}