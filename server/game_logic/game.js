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

export function findGameByCreator(creator){

}

export function addGame(gameCode, playerCount, isComputerGeneratedGame){
    games[gameCode] = new Game(gameCode, playerCount, isComputerGeneratedGame);
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

    addPlayer(player){
        this.players.push(player);

        if(this.players.length-1 >= this.roomSize){
            this.startGame();
            this.broadcastPayloadToClients("")
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

    
    playerGuessLetter(playerIdx, letter){
        // this is a fail safe, canGuessLetter should be ran before this.
        if(!this.canGuessLetter(letter)) return;

        const letterPositions = this.getCharacterIndexes(letter);

        if(letterPositions.length === 0){
            // Invalid guess
            // Tell client of unsuccessful guess
        }else{
            // Valid guess
            this.displayLettersInWordState(letterPositions);

            // Update word state
            // Tell client of a sucessful guess
        }
    }

    getCharacterIndexes(letter){
        return getCharacterIndexes(letter, this.targetWord);       
    }

    displayLettersInWordState(letterIndexes){
        let newWordState = "";
        // If the letter indexes length is 0
        // the return the targetWord because
        // there's nothing to modify.
        if(letterIndexes.length == 0){
            return this.currentWordState;
        }
     
        const character = this.targetWord.charAt(letterIndexes[0]);

        const firstIndex = letterIndexes[0];
        const lastIndex = letterIndexes[letterIndexes.length - 1];

        // If it's only 1, then all we need to do is replace
        // a single character.
        if(letterIndexes.length == 1){
            return this.currentWordState.slice(firstIndex, firstIndex+1) + 
                character + this.currentWordState.slice(firstIndex+1);
        }

        newWordState = this.currentWordState.slice(0, firstIndex);

        const invertedArray = invertArray(letterIndexes);

        // We don't need to always itterate over the entire word
        // So we can just itterate from the range of the first to last index.
        for(let wordStateIdx = firstIndex; wordStateIdx <= lastIndex; wordStateIdx++){
            const index = invertedArray[wordStateIdx];
            if(index === undefined){
                newWordState += this.currentWordState.charAt(index);
            }else{
                newWordState += this.targetWord.charAt(index);
            }
        }
        
        this.wordState = newWordState;
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
            hangmanState: this.hangmanState
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
            players.push(player.serialize());
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