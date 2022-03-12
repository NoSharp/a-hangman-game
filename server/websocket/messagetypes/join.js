import { gameExists, findGameByRoomCode } from '../../game_logic/game.js';
import { BufferWriter } from '../../../shared/buffer.js';
import { getRandomWord } from '../../utils/wordList.js';
import { PacketIdentifiers } from '../../../shared/netIdentifiers.js';
import { kickWebsocket } from '../websocket.js';

export const messageName = 'Join';

export function onMessage(ws, buffer) {
  const roomCode = buffer.readString();
  if (!gameExists(roomCode)) {
    kickWebsocket(ws, 'NO_GAME_FOUND');
    return;
  }

  const game = findGameByRoomCode(roomCode);

  if (game.players.size() >= game.roomSize) {
    kickWebsocket(ws, 'GAME_TOO_MANY_PLAYERS');
    return;
  }

  ws.setRoomCode(roomCode);

  const playerName = getRandomWord();
  const player = game.addPlayer(ws, playerName);

  // Send an accepted response
  let bfWriter = new BufferWriter();
  bfWriter.writeInt(PacketIdentifiers.get('Accepted'), 1);
  player.generateDTO(bfWriter);
  ws.sendBuffer(bfWriter);

  bfWriter = new BufferWriter();
  game.generateDTO(bfWriter);
  // Send game info.
  ws.sendBuffer(bfWriter);
}
