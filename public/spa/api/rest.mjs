import {connectToGameWs} from "./ws.mjs"

export function createGame(gameName, playerCount){
    const newGameCreate = new XMLHttpRequest();
    newGameCreate.open("POST", `/api/game/`);
    newGameCreate.setRequestHeader("Content-Type", "application/json");
    newGameCreate.send(JSON.stringify({
        name: gameName,
        playerCount: playerCount,
        computerGeneratedWord: true
    }));
    
    newGameCreate.onreadystatechange = () => {
        if(newGameCreate.readyState === 4){
            console.log(`Got response : ${newGameCreate.response}`);
            connectToGameWs(gameName);
        }
    };
}

export function joinGame(gameCode){
    const joinGame = new XMLHttpRequest();
    joinGame.open("GET", `/api/game/?room=${gameCode}`);
    joinGame.onreadystatechange = () => {
        if(joinGame.readyState === 4){
            if(joinGame.status !== 200){
                alert("Game not found! Try a different game code or create a game.");
                return;
            }
            console.log(`Got response : ${joinGame.response}`);
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

class GameState {

    constructor(name){
        this.name = name;
        this.players = {};
    }

    addPlayer(name, role){
        this.players[name] = new Player(name, role);
    }
}

function setupGameState(){

}
