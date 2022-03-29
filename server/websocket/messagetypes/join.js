import { gameExists, findGameByRoomCode } from '../../game_logic/game.js';
import { getRandomWord } from '../../utils/wordList.js';
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
  game.acceptPlayer(player);
}
