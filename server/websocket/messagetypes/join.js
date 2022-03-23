import { gameExists, findGameByRoomCode } from '../../game_logic/game.js';
import { BufferWriter } from '../../../shared/buffer.js';
import { getRandomWord } from '../../utils/wordList.js';
import { getPacketId } from '../../../shared/netIdentifiers.js';
import { kickWebsocket } from '../websocket.js';

export const messageName = 'C2SJoin';

export function onMessage(ws, buffer) {
  const roomCode = buffer.readString();
  if (!gameExists(roomCode)) {
    kickWebsocket(ws, 'NO_GAME_FOUND');
    return;
  }

  const game = findGameByRoomCode(roomCode);

  if (game.gameStarted) {
    kickWebsocket(ws, 'GAME_ALREADY_STARTED');
    return;
  }

  if (game.players.size >= game.roomSize) {
    kickWebsocket(ws, 'GAME_TOO_MANY_PLAYERS');
    return;
  }

  ws.setRoomCode(roomCode);

  const playerName = getRandomWord();


  const player = game.addPlayer(ws, playerName);

  // Send an accepted response
  let bfWriter = new BufferWriter();
  bfWriter.writeInt(getPacketId('S2CAccepted'), 1);
  player.generateDTO(bfWriter);
  ws.sendBuffer(bfWriter);

  bfWriter = new BufferWriter();
  game.generateDTO(bfWriter);
  // Send game info.
  ws.sendBuffer(bfWriter);
}
