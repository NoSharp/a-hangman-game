import {connectToGameWs} from "./ws.mjs"
//TODO: switch to fetch.
export function createGame(roomCode, playerCount){
    const newGameCreate = new XMLHttpRequest();
    newGameCreate.open("POST", `/api/game/`);
    newGameCreate.setRequestHeader("Content-Type", "application/json");
    newGameCreate.send(JSON.stringify({
        roomCode: roomCode,
        playerCount: playerCount,
        computerGeneratedWord: true
    }));
    
    newGameCreate.onreadystatechange = () => {
        if(newGameCreate.readyState === 4){
            console.log(`Got response : ${newGameCreate.response}`);
            connectToGameWs(roomCode);
        }
    };
}

//TODO: switch to fetch.
export function joinGame(roomCode){
    const joinGame = new XMLHttpRequest();
    joinGame.open("GET", `/api/game/?room=${roomCode}`);
    joinGame.onreadystatechange = () => {
        if(joinGame.readyState === 4){
            if(joinGame.status !== 200){
                // TODO: Swap from alert, probably display feed back in the 
                alert("Game not found! Try a different game code or create a game.");
                return;
            }
            console.log(`Got response : ${joinGame.response}`);
            connectToGameWs(roomCode);
        }
    };
    joinGame.send();
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