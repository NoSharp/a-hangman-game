// 🎷🐛

import { invertArray } from "../utils/arrayUtils.js";
import { getCharacterIndexes } from "../utils/stringUtils.js";
import { Player } from "./player.js";
import { Role } from "./role.js";

/**
 * This can be constant, however as its mutable. because js.
 * For readability I'd prefer the use of let.
 * 
 * This is a list of key-values, used to represent rooms.
 * The key is a string, the room code.
 * The value is a Game Object.
 */
let games = {};

/**
 * Gets a room by it's code.
 * @param {String} roomCode 
 * @returns {Game}
 */
export function findGameByRoomCode(roomCode){
    return games[roomCode];
}

export function gameExists(roomCode){
    return games[roomCode] !== undefined;
}

export function destroyGame(roomCode){
    delete games[roomCode];
}

export function addGame(roomCode, playerCount, isComputerGeneratedGame){
    games[roomCode] = new Game(roomCode, playerCount, isComputerGeneratedGame);
}

function generateWord(){
    return "flood";
}

export class Game{
 
    /**
     * 
     * @param {string} code
     * @param {number} roomSize
     * @param {boolean} isComputerGeneratedGame
     */
    constructor(code, roomSize, isComputerGeneratedGame){
        
        this.code = code;
        this.roomSize = roomSize;
        this.isComputerGeneratedGame = isComputerGeneratedGame;

        /* The word they'll be guessing */
        this.targetWord = generateWord();
        this.guessedCharacters = {};
        
        // Used to tell the client how to draw the current state of the word
        // a space will be ignored by the client as a missing character
        // anything else will be taken as a successful guess.
        this.currentWordState = this.createWordStateForTargetWord();

        // Used to count the amount of failed guesses.
        // Also used on the client to draw the hangman once networked.
        this.hangmanState = 0;

        this.currentGuesserIdx = 0;

        this.players = [];
    }

    getCode(){
        return this.code;
    }

    getCreator(){
        return this.creator;
    }

    createWordStateForTargetWord(){
        let word = "";
        for(let i = 0; i < this.targetWord.length; i++){
            word += " ";
        }
        return word;
    }

    addPlayer(ws, name){
        const player = new Player(ws, name);
        this.players.push(player);

        if(this.players.length-1 >= this.roomSize){
            this.startGame();
            this.broadcastPayloadToClients("")
        }else{
            // TODO: Broadcast a player join event.
        }
    }

    startGame(){
        this.setupGameRoles();
    }

    setupGameRoles(){
        if(!this.isComputerGeneratedGame){
            this.players[0].updateRole(Role.WORD_MAKER);
        }
    }

    canGuessLetter(letter){
        return this.guessedCharacters[letter] === undefined;
    }

    broadcastGuessStatus(wasGuessCorrect){
        this.broadcastPayloadToClients("GuessStatus", {
            correct: wasGuessCorrect
        })
    }

    playerGuessLetter(player, letter){
        // this is a fail safe, canGuessLetter should be ran before this.
        if(!this.canGuessLetter(letter)) return;
        this.addLetterGuess(letter);

        const letterPositions = this.getCharacterIndexes(letter);
        let correctGuess = false;

        if(letterPositions.length === 0){
            this.incrementHangmanState();
        }else{
            // Valid guess
            this.currentWordState = this.displayLettersInWordState(letterPositions);
            correctGuess = true;
            // Update word state
            // Tell client of a sucessful guess
        }
        
        this.broadcastGuessStatus(correctGuess);
        this.broadcastWordState();
        this.broadcastHangmanState();

        if(this.isGameComplete()){
            this.finishGame();
            return;
        }
        // TODO: turn logic.
    }

    addLetterGuess(letter){
        this.guessedCharacters[letter] = true;
    }

    getCharacterIndexes(letter){
        return getCharacterIndexes(letter, this.targetWord);       
    }

    isGameComplete(){
        return this.didSetterWin() || this.didGuessersWin();
    }

    didSetterWin(){
        return this.hangmanState >= 10;
    }
    
    didGuessersWin(){
        return this.targetWord === this.currentWordState;
    }

    finishGame(){
        this.broadcastPayloadToClients("GameComplete", {
            "winningTeam": this.didSetterWin() ? Role.WORD_MAKER : Role.GUESSING,
        });

        for(const player of this.players){
            player.closeWebSocket();
        }
        // Remove all of the possibly reference counted properties
        // of the object to make sure it's GC'd.
        // Over kill, but w/e.
        delete this.players;
        destroyGame(this.code);
    }

    incrementHangmanState(){
        this.hangmanState += 1;
    }

    displayLettersInWordState(letterIndexes){
        let newWordState = "";

        if(letterIndexes.length == 0){
            return this.currentWordState;
        }
     
        const character = this.targetWord.charAt(letterIndexes[0]);
        const firstIndex = letterIndexes[0];

        // If the index is 0, then we don't need to do anything and can just set
        // an empty string.
        newWordState = firstIndex > 0 ? this.currentWordState.slice(0, firstIndex) : "";

        // If it's only 1, then all we need to do is replace a single character.
        if(letterIndexes.length == 1){
            return newWordState + character + this.currentWordState.slice(firstIndex+1);
        }

        // We don't need this index unless the length is > 1.
        const lastIndex = letterIndexes[letterIndexes.length - 1];

        // This is used because indexing an object is faster that itterating over an array.
        const invertedArray = invertArray(letterIndexes);

        // We don't need to always itterate over the entire word so we can just itterate from the first to last index.
        for(let wordStateIdx = firstIndex; wordStateIdx <= lastIndex; wordStateIdx++){
            const index = invertedArray[wordStateIdx];
            newWordState += index === undefined ? 
                this.currentWordState.charAt(wordStateIdx) : 
                this.targetWord.charAt(wordStateIdx);
                
        }
        newWordState += this.currentWordState.slice(lastIndex+1);

        return newWordState;
    }

    broadcastHangmanState(){
        this.broadcastPayloadToClients("HangManState", this.serializeHangmanState());
    }

    broadcastWordState(){
        this.broadcastPayloadToClients("WordState", this.serializeWordStateInfo());
    }

    broadcastPlayerJoin(){
        this.broadcastPayloadToClients("PlayerJoin", this.serializePlayers());
    }

    /**
     * Converts the game data into an object
     * that the websocket server will send the client.
     * @returns {Object} The payload to send to the client
     */
    serializeGameInfo(){
        return {
            code: this.code,
            roomSize: this.roomSize,
            wordState: this.serializeWordStateInfo(),
            hangmanState: this.hangmanState,
            players: this.serializePlayers()
        }
    }

    /**
     * 
     * @returns {Object} the hangman state
     */
    serializeHangmanState(){
        return {
            hangmanState: this.hangmanState
        };
    }

    serializePlayers(){
        let players = [];
        
        for(const player of this.players){
            players.push(player.generateDTO());
        }

        return players;
    }

    serializeWordStateInfo(){
        return {
            currentWordState: this.currentWordState,
            guessedCharacters: this.guessedCharacters,
        }
    }

    broadcastPayloadToClients(name, payload){
        this.players.forEach((ply)=>{
            ply.sendPayload(name, payload);
        });
    }
}