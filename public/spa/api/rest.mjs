"use strict";

import {connectToGameWs} from "./ws.mjs"
export async function createGame(roomCode, playerCount){

    const newGameCreate = await fetch("/api/game/",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomCode: roomCode,
            playerCount: playerCount,
            computerGeneratedWord: true
        })
    });

    const status = newGameCreate.status;

    if(status !== 200){
        // TODO: work out another form of user input.
        alert("Cannot create a game, try joining instead.");
        return;
    }
    
    connectToGameWs(roomCode);

}

export async function joinGame(roomCode){
    const res = await fetch(`/api/game/?room=${roomCode}`);
    
    const resStatus = res.status;
    if(resStatus !== 200){
        // TODO: Swap from alert, probably display feed back in the 
        alert("Game not found! Try a different game code or create a game.");
        return;
    }

    res.json()
        .then(dat=> console.log(dat))
        .catch(err=> console.log(err));

    connectToGameWs(roomCode);
}

class Player {

    constructor(name, role){
        this.name = name;
        this.role = role;
    }

    getName(){
        return this.name;
    }

    getRole(){
        return this.role;
    }
}