import { findGameByRoomCode } from '../../game_logic/game.js';
export const messageName = 'C2SMakeGuess';

export function onMessage(ws, buffer) {
  const character = buffer.readChar();
  if (character === undefined) {
    console.log('Character is undefined. ignoring.');
    return;
  }
  const game = findGameByRoomCode(ws.getRoomCode());
  if (game === undefined) return;

  const player = ws.getPlayerInstance();
  if (player === undefined) return;
  if (!game.canPlayerGuess(player) || !game.canGuessLetter(character)) return;

  game.playerGuessLetter(player, character);
}
