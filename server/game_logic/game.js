// 🎷🐛
import { bitPack, BufferWriter } from '../../shared/buffer.js';
import { PacketIdentifiers } from '../../shared/netIdentifiers.js';
import { TeamIdentifiers } from '../../shared/teamIdentifiers.js';
import { invertArray } from '../utils/arrayUtils.js';
import { getCharacterIndexes } from '../utils/stringUtils.js';
import { getRandomWord } from '../utils/wordList.js';
import { Player } from './player.js';

/**
 * This is a list of key-values, used to represent rooms.
 * The key is a string, the room code.
 * The value is a Game Object.
 */
const games = {};

/**
 * Gets a room by it's code.
 * @param {String} roomCode
 * @returns {Game}
 */
export function findGameByRoomCode(roomCode) {
  return games[roomCode];
}

export function gameExists(roomCode) {
  return games[roomCode] !== undefined;
}

export function destroyGame(roomCode) {
  delete games[roomCode];
}

export function addGame(roomCode, playerCount, isComputerGeneratedGame) {
  games[roomCode] = new Game(roomCode, playerCount, isComputerGeneratedGame ?? true);
}

function generateWord() {
  return getRandomWord();
}

export class Game {
  /**
   *
   * @param {string} code
   * @param {number} roomSize
   */
  constructor(code, roomSize) {
    this.code = code;
    this.roomSize = roomSize;
    /* The word they'll be guessing */
    this.targetWord = generateWord();
    this.guessedCharacters = new Map();

    // Used to tell the client how to draw the current state of the word
    // a space will be ignored by the client as a missing character
    // anything else will be taken as a successful guess.
    this.currentWordState = this.createWordStateForTargetWord();

    // Used to count the amount of failed guesses.
    // Also used on the client to draw the hangman once networked.
    this.hangmanState = 0;

    this.currentGuesserId = 0;
    this.gameStarted = false;
    this.players = new Map();
    this.playerIterator = this.players.values();
  }


  createWordStateForTargetWord() {
    let word = '';
    for (let i = 0; i < this.targetWord.length; i++) {
      word += ' ';
    }
    return word;
  }

  addPlayer(ws, name) {
    const player = new Player(ws, name, this.players.size);
    this.players.set(player.id, player);
    this.broadcastPlayerJoin(player);
    console.log(this.players.size, this.roomSize);
    if (this.players.size >= this.roomSize) {
      this.startGame();
    }
    return player;
  }

  startGame() {
    this.gameStarted = true;
    this.broadcastGameStart();
    this.incrementGuesser();
  }

  canGuessLetter(letter) {
    return this.guessedCharacters[letter] === undefined;
  }

  canPlayerGuess(player) {
    return this.currentGuesserId === player.id;
  }

  setCurrentGuesserId(id) {
    this.currentGuesserId = id;
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('Guesser'), 1);
    buffer.writeInt(this.currentGuesserId, 1);
    this.broadcastBufferToClients(buffer);
  }

  incrementGuesser() {
    const player = this.playerIterator.next().value;
    // reset our iterator.
    if (player == null) {
      this.playerIterator = this.players.values();
      this.incrementGuesser();
      return;
    }

    this.setCurrentGuesserId(player.id);
  }

  playerGuessLetter(player, letter) {
    if (this.currentGuesserId !== player.id) return;
    // this is a fail safe, canGuessLetter should be ran before this.
    if (!this.canGuessLetter(letter)) return;
    this.addLetterGuess(letter);

    const letterPositions = this.getCharacterIndexes(letter);
    let correctGuess = false;

    if (letterPositions.length === 0) {
      this.incrementHangmanState();
    } else {
      this.currentWordState = this.replaceLettersInWordState(letterPositions);
      correctGuess = true;
      this.broadcastWordState();
    }

    this.broadcastGuess(letter, correctGuess);

    if (this.isGameComplete()) {
      this.finishGame();
      return;
    }

    this.incrementGuesser();
  }

  addLetterGuess(letter) {
    this.guessedCharacters.set(letter, true);
  }

  getCharacterIndexes(letter) {
    return getCharacterIndexes(letter, this.targetWord);
  }

  isGameComplete() {
    return this.didSetterWin() || this.didGuessersWin();
  }

  didSetterWin() {
    return this.hangmanState >= 10;
  }

  didGuessersWin() {
    return this.targetWord === this.currentWordState;
  }

  finishGame() {
    this.broadcastGameComplete(this.didSetterWin() ? 'CPU' : 'PLAYERS');

    for (const player of this.players.values()) {
      player.closeWebSocket();
    }

    destroyGame(this.code);
  }

  incrementHangmanState() {
    this.hangmanState += 1;
    this.broadcastHangmanState();
  }

  replaceLettersInWordState(letterIndexes) {
    let newWordState = '';

    if (letterIndexes.length === 0) {
      return this.currentWordState;
    }

    const character = this.targetWord.charAt(letterIndexes[0]);
    const firstIndex = letterIndexes[0];

    // If the index is 0, then we don't need to do anything and can just set
    // an empty string.
    newWordState = firstIndex > 0 ? this.currentWordState.slice(0, firstIndex) : '';

    // If it's only 1, then all we need to do is replace a single character.
    if (letterIndexes.length === 1) {
      return newWordState + character + this.currentWordState.slice(firstIndex + 1);
    }

    // We don't need this index unless the length is > 1.
    const lastIndex = letterIndexes[letterIndexes.length - 1];

    // This is used because indexing an object is faster that itterating over an array.
    const invertedArray = invertArray(letterIndexes);

    // We don't need to always itterate over the entire word so we can just itterate from the first to last index.
    for (let wordStateIdx = firstIndex; wordStateIdx <= lastIndex; wordStateIdx++) {
      const index = invertedArray[wordStateIdx];
      newWordState += index === undefined
        ? this.currentWordState.charAt(wordStateIdx)
        : this.targetWord.charAt(wordStateIdx);
    }

    newWordState += this.currentWordState.slice(lastIndex + 1);

    return newWordState;
  }

  broadcastGameComplete(winningTeam) {
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('GameComplete'), 1);
    buffer.writeInt(TeamIdentifiers.get(winningTeam), 1);
    this.broadcastBufferToClients(buffer);
  }

  broadcastGuess(char, wasGuessCorrect) {
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('Guess'), 1);
    buffer.writeChar(char);
    buffer.writeBoolean(wasGuessCorrect);
    this.broadcastBufferToClients(buffer);
  }

  broadcastHangmanState() {
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('HangmanState'), 1);
    this.generateHangmanDTO(buffer);
    this.broadcastBufferToClients(buffer);
  }

  broadcastWordState() {
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('WordState'), 1);
    this.generateWordStateDTO(buffer);
    this.broadcastBufferToClients(buffer);
  }

  broadcastPlayerJoin(player) {
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('PlayerJoin'), 1);
    player.generateDTO(buffer);
    this.broadcastBufferToClients(buffer);
  }

  broadcastGameStart() {
    const buffer = new BufferWriter();
    buffer.writeInt(PacketIdentifiers.get('GameStarted'), 1);
    this.broadcastBufferToClients(buffer);
  }

  /**
   * Converts the game data into a data transfer object
   * Used on Synchronise requests sent by the client.
   * @returns {Object} The payload to send to the client
   */
  generateDTO(buffer) {
    buffer.writeInt(PacketIdentifiers.get('Synchronise'), 1);
    buffer.writeInt(bitPack(this.hangmanState, this.players.size, 5, 8), 1);
    this.generateWordStateDTO(buffer);
    for (const char of this.guessedCharacters.keys()) {
      buffer.writeChar(char);
    }
    buffer.writeInt(0x00, 1); // null terminate the array
    for (const player of this.players.values()) {
      player.generateDTO(buffer);
    }
    buffer.writeInt(this.currentGuesserId, 1);
  }

  /**
   *
   * @returns {Object} the hangman state
   */
  generateHangmanDTO(buffer) {
    buffer.writeInt(this.hangmanState, 1);
  }

  generateWordStateDTO(buffer) {
    buffer.writeString(this.currentWordState);
  }

  generateGuessedCharactersDTO() {
    const guessedChars = [];
    for (const val of this.guessedCharacters.keys()) {
      guessedChars.push(val);
    }
    return guessedChars;
  }

  broadcastBufferToClients(buffer) {
    this.players.forEach((ply) => {
      ply.sendBuffer(buffer);
    });
  }
}
