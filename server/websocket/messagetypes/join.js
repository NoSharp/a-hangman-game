import { gameExists, findGameByRoomCode } from '../../game_logic/game.js';
import { getRandomWord } from '../../utils/wordList.js';
import { isValidJoinRequest } from '../requestValidation.js';

export const messageName = 'Join';

export function onMessage(ws, data) {
  if (!isValidJoinRequest(data)) {
    ws.sendInvalidResponse('Invalid Join Body');
    return;
  }

  const roomCode = data.roomCode;
  if (!gameExists(roomCode)) {
    ws.sendResponse('Kick', {
      reason: 'NO_GAME_FOUND',
    });
    return;
  }

  const game = findGameByRoomCode(roomCode);

  if (game.players.length >= game.roomSize) {
    ws.sendResponse('Kick', {
      reason: 'GAME_TOO_MANY_PLAYERS',
    });
    return;
  }

  ws.setRoomCode(roomCode);

  data.playerName = getRandomWord();
  game.addPlayer(ws, data.playerName);

  // Send an accepted response
  ws.sendResponse('Accepted', {
    name: data.playerName,
  });

  // Send game info.
  ws.sendResponse('GameInfo', game.serializeGameInfo());
}
