// The word that the user is guessing.
let gameWord = [];

// Guessed characters.
// True is that it's in the word and successful.
// False if it's not in the word.
let characters = {}

// Current word state.
let currentWordState = [];

function showCharacter(idx){
    const wordStatus = document.querySelectorAll(".word-status>.char");
    console.log(wordStatus);
    console.log(idx);
    wordStatus[idx].innerText = gameWord[idx];
}

function setupGame(word){
    gameWord = word;
    currentWordState = [];
    for(let i = 0; i < word.length; i++){
        currentWordState[i] = " ";
    }
}

function getWordState(){
    return currentWordState.join('');
}

function isCharacterGuessed(character){
    return characters[character] !== undefined;
}


function removeCharAtIndex(str, idx){
    return str.substring(0,idx) + str.substring(idx+1);
}

function swapCharAtIndex(str, idx){
    return str.substring(0,idx) + " " + str.substring(idx+1);
}

function onGameLose(){
}

function checkGameStatus(){

    if(getHangmanState() === 7){
        alert("Game lost");
    }
    console.log(getWordState().toLowerCase(), gameWord.toLowerCase());
    if(getWordState().toLowerCase() === gameWord.toLowerCase()){
        alert("Game won!");
        
    }
}

function guessCharacter(char){
    let gameWordLower = gameWord.toLowerCase();
    char = char.toLowerCase();

    while(true){
        let idx = gameWordLower.indexOf(char);
        if(idx === -1) {
            break;
        }
        console.log(char);
        if(characters[char] === undefined){
            const inWord = idx != -1;
            characters[char] = inWord;
            console.log("setting character!")
        }

        if(currentWordState[idx] === char){
            break;
        }
        
        showCharacter(idx);
        currentWordState[idx] = char;
        gameWordLower = swapCharAtIndex(gameWordLower, idx);
    }

    console.log(characters[char])
    if(!characters[char]){
        incrementHangmanState();
    }

    checkGameStatus();
}