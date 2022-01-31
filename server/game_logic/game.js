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
     * @param {Player} creator 
     * @param {number} roomSize
     */
    constructor(code, roomSize){
        this.code = code;
        this.roomSize = roomSize;
        this.word = generateWord();
    }

    getCode(){
        return this.code;
    }

    getCreator(){
        return this.creator;
    }

    /**
     * Converts the game data into an object
     * that the websocket server will send the client.
     * @returns {Object} The payload to send to the client
     */
    serialize(){
        
    }
}