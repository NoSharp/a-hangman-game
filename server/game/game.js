// 🎷🐛

import { Player } from "./player.js";

/**
 * This can be constant, however as its mutable
 * for readability I'd prefer the use of let.
 * 
 * This is a list of key-values, used to represent rooms.
 * The key is a string, the room code.
 * The value is a Game Object.
 */
let games = {}

export function findGameByRoomCode(roomCode){
    return games[roomCode]
}

export function findGameByCreator(creator){

}

export function addGame(gameCode, playerCount){
    games[gameCode] = new Game(gameCode, playerCount);
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
    }

    getCode(){
        return this.code;
    }


    getCreator(){
        return this.creator;
    }
}