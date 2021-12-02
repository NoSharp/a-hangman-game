import {WebSocketServer, WebSocket} from "ws";

const wsConnections = {};

/**
 * Handle websocket connection
 * @param {WebSocket} ws 
 */
function initiateWebSocket(ws){

    ws.on("message",(data)=>{
        console.log("DATA: %s", data);
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
        initiateWebSocket(ws) 
    });
    // wss.on("close")
}