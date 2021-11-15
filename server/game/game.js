// 🎷🐛

import { Player } from "./player";

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


export class Game{
 
    /**
     * 
     * @param {string} code 
     * @param {Player} creator 
     */
    constructor(code, creator){
        this.code = code;
        this.creator = creator;
        this.players = [this.creator];
    }

    getCode(){
        return this.code;
    }


    getCreator(){
        return this.creator;
    }
}