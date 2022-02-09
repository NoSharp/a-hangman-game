import {displayGameSection, setWordToGuess} from "../dom/game.mjs";

let ws = undefined;

let shouldRenderOnNextGameInfo = false;

let currentGameInfo = {};

function getCurrentWordState(){
    return currentGameInfo?.wordState?.currentWordState ?? "";
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
    },

    "WordState": function(data){
        currentGameInfo.wordState = data;
        setWordToGuess(getCurrentWordState());
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