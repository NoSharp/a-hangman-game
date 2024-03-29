import { createGame, joinGame } from '../api/rest.mjs';

export function gameCreationSubmit() {
  const gameName = document.getElementById('game-name-create');
  const playerCount = document.getElementById('player-count');
  createGame(gameName.value, parseInt(playerCount.value));
}

export function gameCreationJoin() {
  joinGame(document.getElementById('game-name-join').value);
}
