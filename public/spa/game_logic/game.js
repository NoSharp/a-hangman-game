// The word that the user is guessing.
let gameWord = [];

// Guessed characters.
// True is that it's in the word and successful.
// False if it's not in the word.
let characters = {}

// Current word state.
let currentWordState = [];

function showCharacter(idx){
    const wordStatus = document.querySelector(".word-status");
    wordStatus[idx].setText(gameWord[idx]);
}

export function setupGame(word){
    gameWord = word;
    currentWordState = "";
    for(let i = 0; i < word.length(); i++){
        currentWordState[i] = " ";
    }
}

export function getWordState(){
    return gameWord;
}

export function isCharacterGuessed(character){
    return characters[character] !== undefined;
}

export function guessCharacter(char){
    let idx = gameWord.indexOf(char);
    showCharacter(idx);
    while(idx != -1){
        currentWordState[idx] = char;
        idx = gameWord.indexOf(char);
        showCharacter(idx);
    }
    characters[char] = inWord;
}