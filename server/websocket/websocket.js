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
    console.log("Got here?");
    ws.on("message",(rawData)=>{
        const data = JSON.parse(rawData);
        if(!isValidRequest(data)){
            ws.send(JSON.stringify(createInvalidPayloadMessage("Invalid Request")));
            console.log("DATA: %s", JSON.parse(data));
        }else{
            console.log(data.message, getActioner(data.message));
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
    
    wss.on("connection", (ws) => {
        console.log("Got connection?");
        initiateWebSocket(ws);
    });
    // wss.on("close")
}