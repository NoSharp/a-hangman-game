import {WebSocketServer, WebSocket} from "ws";
import { isValidRequest, createInvalidPayloadMessage } from "./requestValidation.js";
import {getActioner} from "./messageTypes.js";

const wsConnections = {};

function unknownMessage(sender, payload){
    sender.sendInvalidResponse(createInvalidPayloadMessage("Unknown Message"));
}

/**
 * Handle websocket connection
 * @param {WebSocket} ws 
 */
function initiateWebSocket(ws){
    
    ws.on("message",(rawData)=>{
        const data = JSON.parse(rawData);
        if(!isValidRequest(data)){
            ws.send(JSON.stringify(createInvalidPayloadMessage("Invalid Request")));
        }else{
            console.log(`[RECV]: ${data.message} -> ${data.payload}`);
            (getActioner(data.message) ?? unknownMessage)(ws, data.payload);
        }
    });

    ws.on("open", ()=>{ console.log("Connected!")});

    ws.on("error", (err)=>{ console.log(`err ${err}`)});

    ws.on("close", () => {console.log("closed!")});
}

/**
 * Used to mount events, and other things
 * for the websocket manager to, well,
 * manage on the websocket.
 * @param wss {WebSocketServer}
 */
export function mountWebSocketManager(wss){

    WebSocket.prototype.sendObject = function(obj){
        this.send(JSON.stringify(obj));
    }

    WebSocket.prototype.sendInvalidResponse = function (err){
        this.sendObject(createInvalidPayloadMessage(err));
    }

    WebSocket.prototype.sendResponse = function(message, payload){
        this.sendObject({
            "message": message,
            "payload": payload
        });
    }

    WebSocket.prototype.setGameCode = function(game){
        this.gameCode = game;
    }

    WebSocket.prototype.getGameCode = function(){
        return this.gameCode;
    }

    WebSocket.prototype.setPlayerInstance = function(player){
        this.playerInstance = player;
    }

    WebSocket.prototype.getPlayerInstance = function(){
        return this.playerInstance;
    }
    
    


    wss.on("connection", (ws) => {
        console.log("Got connection?");
        initiateWebSocket(ws);
    });
    // wss.on("close")
}