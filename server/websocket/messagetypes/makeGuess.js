import { isValidMakeGuessRequest } from '../requestValidation.js';
import { findGameByRoomCode } from '../../game_logic/game.js';
export const messageName = 'MakeGuess';

export function onMessage(ws, data) {
  if (!isValidMakeGuessRequest(data)) {
    ws.sendInvalidResponse('Invalid Make Guess Body');
    return;
  }
  const game = findGameByRoomCode(ws.getRoomCode());
  if (game === undefined) return;

  const player = ws.getPlayerInstance();
  if (player === undefined) return;
  if (!game.canPlayerGuess(player) || !game.canGuessLetter(data.guess)) return;

  game.playerGuessLetter(player, data.guess);
}
