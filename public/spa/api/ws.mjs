import {displayGameSection, setWordToGuess, setCharactersGuessed, setCoverKeyboardText, showHangmanPart, showKeyboard} from "../dom/game.mjs";
import { Role,getNameFromRole, Player } from "../game_logic/game.mjs";

let ws = undefined;

let shouldRenderOnNextGameInfo = false;

let currentGameInfo = {};

let players = {};

let currentUserName = (Math.random() * 100).toString();

function getCurrentWordState(){
    return currentGameInfo?.wordState?.currentWordState ?? "";
}

function updateWordState(){
    setWordToGuess(getCurrentWordState());
    const chars = currentGameInfo.wordState.guessedCharacters;
    for(const char in chars){
        setCharactersGuessed(char);
    }
}

function updateHangmanState(){
    const curState = currentGameInfo.hangmanState;
    for(let i = 1; i <= curState; i++ ){
        showHangmanPart(i);
    }
}

function runPlayerUpdate(){
    const curPlayers = currentGameInfo.players;
    players = {};
    let isGuessingThisRound = true;
    for(const player in curPlayers){
        const plyObj = Player.fromDTO(curPlayers[player]);
        players[plyObj.getName()] = plyObj;
       if(plyObj.getName() !== currentUserName && plyObj.getRole() === Role.GUESSING){
            setCoverKeyboardText(`${plyObj.getName()} is currently guessing`);
            isGuessingThisRound = false;
        }
    }

    if(isGuessingThisRound){
        showKeyboard();
    }
}


const messageHandlers = {
    
    "Accepted": function(data){
        shouldRenderOnNextGameInfo = true;
    },

    "GameInfo": function(data){
        currentGameInfo = data;
    
        if(shouldRenderOnNextGameInfo){
            displayGameSection();
            shouldRenderOnNextGameInfo = false;
        }

        setWordToGuess(getCurrentWordState());
        updateWordState();
        updateHangmanState();
        runPlayerUpdate();

    },

    "WordState": function(data){
        currentGameInfo.wordState = data;
        updateWordState();
    },

    "GuessStatus": function(data){
        // TODO: Actually do something here.
        console.log(data.correct);
    },

    "GameComplete": function(data){
        setCoverKeyboardText(`${getNameFromRole(data.winningTeam)} Won the game`);
    },

    "HangManState": function(data){
        currentGameInfo.hangmanState = data.hangmanState;
        updateHangmanState();
    },

    "PlayerJoin": function(data){
        currentGameInfo.players = data;
        runPlayerUpdate();
    },

    "PlayerData": function(data){
        if(players[data.name] === undefined){
            players[data.name] = Player.fromDTO(data);
        }else{
            players[data.name].setRole(data.role);
        }

        if(data.name !== currentUserName && data.role === Role.GUESSING){
            setCoverKeyboardText(`${data.name} is currently guessing`);
        }else{
            showKeyboard();
        }
    }

};

export function sendPayload(payloadName, data){
    ws.send(JSON.stringify({
        "message": payloadName,
        "payload": data
    }));
}

export function connectToGameWs(roomCode){

    ws = new WebSocket(`${location.href.replace("http", "ws")}`);

    ws.onmessage = (ev) =>{
        let messageData = JSON.parse(ev.data);
        console.log(messageData);
        const messageName = messageData.message;
        
        if(messageName === undefined){
            console.log(`Error handling packet: ${ev.data}`);
            return;
        }
        
        if(messageHandlers[messageName] === undefined){
            console.log(`No handler defined for: ${messageName}`);
            return;
        }

        messageHandlers[messageName](messageData.payload);
    };

    ws.onopen = () =>{
            
        ws.send(JSON.stringify({
            "message": "Join",
            "payload": {
                "roomCode": roomCode,
                "playerName" : currentUserName
            }
        }));
    };

    ws.onerror = (err)=>{
        console.log(err);
    }
}

export function makeGuess(char){
    sendPayload("MakeGuess", {
        "guess": char
    });
}

/**
 * - Single POST request for handling the order placement
 * - API then prompts server (person not machine) to create Ice cream
 * - 
 */