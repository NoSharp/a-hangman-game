import { WebSocket } from 'ws';
import { createInvalidPayloadMessage } from './requestValidation.js';
import { getActioner } from './messageTypes.js';
import { BufferReader, BufferWriter } from '../../shared/buffer.js';
import { getPacketName, getPacketId } from '../../shared/netIdentifiers.js';

/**
 * Handle websocket connection
 * @param {WebSocket} ws
 */
function initiateWebSocket(ws) {
  ws.on('message', (rawData) => {
    const buffer = BufferReader.fromString(rawData.toString());
    const packetId = buffer.readInt(1);

    if (packetId == null) {
      console.log(`Packet ID: ${packetId} is not defined. `);
      return;
    }

    const packetName = getPacketName(packetId);
    if (packetName == null) {
      console.log(`Packet ID: ${packetId} has no name.`);
      return;
    }

    const actioner = getActioner(packetName);
    if (actioner == null) {
      console.log(`Packet ID: ${packetName} has no actioner.`);
      return;
    }

    console.log(`[RECV]: ${packetName} Size: ${rawData.byteLength}b`);
    actioner(ws, buffer);
  });

  ws.on('open', () => { console.log('Connected!'); });

  ws.on('error', (err) => { console.log(`err ${err}`); });

  ws.on('close', () => { console.log('closed!'); });
}

export function kickWebsocket(ws, reason) {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2CKick'), 1);
  buffer.writeString(reason);
  ws.sendBuffer(buffer);
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

  WebSocket.prototype.sendBuffer = function (buffer) {
    this.send(buffer.getBufferAsString());
  };

  wss.on('connection', (ws) => {
    console.log('Got connection?');
    initiateWebSocket(ws);
  });
  // wss.on("close")
}
