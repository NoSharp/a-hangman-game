import { BufferWriter, bitPack } from '../../shared/buffer.js';
import { getPacketId } from '../../shared/netIdentifiers.js';
import { TeamIdentifiers } from '../../shared/teamIdentifiers.js';

/**
   * Converts the game data into a data transfer object
   * Used on Synchronise requests sent by the client.
   * @returns {Object} The payload to send to the client
   */
function generateDTO(game, buffer) {
  buffer.writeInt(bitPack(game.hangmanState, game.players.size, 5, 8), 1);
  generateWordStateDTO(game, buffer);
  for (const char of game.guessedCharacters.keys()) {
    buffer.writeChar(char);
  }
  buffer.writeInt(0x00, 1); // null terminate the array
  for (const player of game.players.values()) {
    player.generateDTO(buffer);
  }
  buffer.writeInt(game.currentGuesserId, 1);
}

/**
 *
 * @returns {Object} the hangman state
 */
function generateHangmanDTO(game, buffer) {
  buffer.writeInt(game.hangmanState, 1);
}

function generateWordStateDTO(game, buffer) {
  buffer.writeString(game.currentWordState);
}

function broadcastBufferToClients(game, buffer) {
  game.players.forEach((ply) => {
    ply.sendBuffer(buffer);
  });
}

export function acceptPlayer(player) {
  const bfWriter = new BufferWriter();
  bfWriter.writeInt(getPacketId('S2CAccepted'), 1);
  player.generateDTO(bfWriter);
  generateDTO(this, bfWriter);
  player.sendBuffer(bfWriter);
}

export function broadcastGameComplete(winningTeam) {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2COnGameComplete'), 1);
  buffer.writeInt(TeamIdentifiers.get(winningTeam), 1);
  buffer.writeInt(this.getScore(), 2);
  broadcastBufferToClients(this, buffer);
}

export function broadcastGuesserUpdate() {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2CGuesserUpdate'), 1);
  buffer.writeInt(this.currentGuesserId, 1);
  broadcastBufferToClients(this, buffer);
}

export function broadcastGuess(char, wasGuessCorrect) {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2CGuessMade'), 1);
  buffer.writeChar(char);
  buffer.writeBoolean(wasGuessCorrect);
  broadcastBufferToClients(this, buffer);
}

export function broadcastHangmanState() {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2CHangmanStateUpdate'), 1);
  generateHangmanDTO(this, buffer);
  broadcastBufferToClients(this, buffer);
}

export function broadcastWordState() {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2CWordStateUpdate'), 1);
  generateWordStateDTO(this, buffer);
  broadcastBufferToClients(this, buffer);
}

export function broadcastPlayerJoin(player) {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2COnPlayerJoin'), 1);
  player.generateDTO(buffer);
  broadcastBufferToClients(this, buffer);
}

export function broadcastGameStart() {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('S2COnGameStarted'), 1);
  broadcastBufferToClients(this, buffer);
}
