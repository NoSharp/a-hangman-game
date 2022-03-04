import { WebSocket } from 'ws';
import { isValidRequest, createInvalidPayloadMessage } from './requestValidation.js';
import { getActioner } from './messageTypes.js';

function unknownMessage(sender) {
  sender.sendInvalidResponse(createInvalidPayloadMessage('Unknown Message'));
}

/**
 * Handle websocket connection
 * @param {WebSocket} ws
 */
function initiateWebSocket(ws) {
  ws.on('message', (rawData) => {
    const data = JSON.parse(rawData);
    if (!isValidRequest(data)) {
      ws.send(JSON.stringify(createInvalidPayloadMessage('Invalid Request')));
    } else {
      console.log(`[RECV]: ${data.message} -> ${data.payload}`);
      (getActioner(data.message) ?? unknownMessage)(ws, data.payload);
    }
  });

  ws.on('open', () => { console.log('Connected!'); });

  ws.on('error', (err) => { console.log(`err ${err}`); });

  ws.on('close', () => { console.log('closed!'); });
}

/**
 * Used to mount events, and other things
 * for the websocket manager to, well,
 * manage on the websocket.
 * @param wss {WebSocketServer}
 */
export function mountWebSocketManager(wss) {
  WebSocket.prototype.sendObject = function (obj) {
    this.send(JSON.stringify(obj));
  };

  WebSocket.prototype.sendInvalidResponse = function (err) {
    this.sendObject(createInvalidPayloadMessage(err));
  };

  WebSocket.prototype.sendResponse = function (message, payload) {
    this.sendObject({
      message,
      payload,
    });
  };

  WebSocket.prototype.setRoomCode = function (game) {
    this.roomCode = game;
  };

  WebSocket.prototype.getRoomCode = function () {
    return this.roomCode;
  };

  WebSocket.prototype.setPlayerInstance = function (player) {
    this.playerInstance = player;
  };

  WebSocket.prototype.getPlayerInstance = function () {
    return this.playerInstance;
  };


  wss.on('connection', (ws) => {
    console.log('Got connection?');
    initiateWebSocket(ws);
  });
  // wss.on("close")
}
