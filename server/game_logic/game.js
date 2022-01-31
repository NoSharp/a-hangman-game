// 🎷🐛

import { Player } from "./player.js";

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

export function addGame(gameCode, playerCount){
    games[gameCode] = new Game(gameCode, playerCount);
}

function generateWord(){
    return "flood";
}

export class Game{
 
    /**
     * 
     * @param {string} code
     * @param {number} roomSize
     */
    constructor(code, roomSize){
        this.code = code;
        this.roomSize = roomSize;
        
        /* The word they'll be guessing */
        this.targetWord = generateWord();
        this.guessedCharacters = {};
        
        // Used to tell the client how to draw the current state of the word
        // a space will be ignored by the client as a missing character
        // anything else will be taken as a successful guess.
        this.currentWordState = "";

        // Used to count the amount of failed guesses.
        // Also used on the client to draw the hangman once networked.
        this.hangmanState = 0;

        this.players = [];
    }

    getCode(){
        return this.code;
    }

    getCreator(){
        return this.creator;
    }

    addPlayer(player){
        this.players.push(player);
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

    serializeWordStateInfo(){
        return {
            currentWordState: this.currentWordState,
            guessedCharacters: this.guessedCharacters,
        }
    }
}