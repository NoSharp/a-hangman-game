import {WebSocketServer, WebSocket} from "ws";
import { isValidRequest, createInvalidPayloadMessage } from "./requestValidation.js";
import messageTypes from "./messageTypes.cjs";
const {getActioner} = messageTypes;
const wsConnections = {};

function unknownMessage(sender, payload){
    sender.send(JSON.stringify(createInvalidPayloadMessage("Unknown Message")))
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
            console.log("DATA: %s", JSON.parse(data));
            return;
        }else{
            (getActioner(data.message) ?? unknownMessage)(ws, data);
        }
    })
}

/**
 * Used to mount events, and other things
 * for the websocket manager to, well,
 * manage on the websocket.
 * @param wss {WebSocketServer}
 */
export function mountWebSocketManager(wss){

    wss.on("connection", (ws) => { 
        console.log("Got connection?")
        initiateWebSocket(ws) 
    });
    // wss.on("close")
}