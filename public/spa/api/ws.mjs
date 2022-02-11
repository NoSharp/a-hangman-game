import {displayGameSection, setWordToGuess, setCharactersGuessed, coverKeyboard, showHangmanPart} from "../dom/game.mjs";
import { Role,getNameFromRole } from "../game_logic/game.mjs";

let ws = undefined;

let shouldRenderOnNextGameInfo = false;

let currentGameInfo = {};

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
        console.log(data);

        coverKeyboard(`${getNameFromRole(data.winningTeam)} Won the game`);
    },
    "HangManState": function(data){
        currentGameInfo.hangmanState = data.hangmanState;
        updateHangmanState();
    }
};

export function sendPayload(payloadName, data){
    ws.send(JSON.stringify({
        "message": payloadName,
        "payload": data
    }));
}

export function connectToGameWs(gameCode){

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
                "name": gameCode
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