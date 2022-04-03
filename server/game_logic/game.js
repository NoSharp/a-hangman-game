// 🎷🐛
import { invertArray } from '../utils/arrayUtils.js';
import { inflate } from '../utils/inflateDecorator.js';
import { getCharacterIndexes } from '../utils/stringUtils.js';
import { getRandomWord } from '../utils/wordList.js';
import { broadcastGameComplete, broadcastGuess, broadcastGameStart, broadcastHangmanState, broadcastPlayerJoin, broadcastWordState, broadcastGuesserUpdate, acceptPlayer } from './networking.js';
import { Player } from './player.js';


// TODO: Decouple network handling.
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
    this.currentScore = 0;

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

  incrementScore() {
    this.currentScore++;
  }

  getScore() {
    return this.currentScore;
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
    this.broadcastGuesserUpdate();
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

  // eslint-disable-next-line no-unused-vars
  acceptPlayer(player) {
    // INFLATED: networking.js
  }

  broadcastGuesserUpdate() {
    // INFLATED: networking.js
  }

  // eslint-disable-next-line no-unused-vars
  broadcastGameComplete(winningTeam) {
    // INFLATED: networking.js
  }

  // eslint-disable-next-line no-unused-vars
  broadcastGuess(char, wasGuessCorrect) {
    // INFLATED: networking.js
  }

  // eslint-disable-next-line no-unused-vars
  broadcastHangmanState() {
    // INFLATED: networking.js
  }

  // eslint-disable-next-line no-unused-vars
  broadcastWordState() {
    // INFLATED: networking.js
  }

  // eslint-disable-next-line no-unused-vars
  broadcastPlayerJoin(player) {
    // INFLATED: networking.js
  }

  broadcastGameStart() {
    // INFLATED: networking.js
  }
}

// Inflation

inflate(Game.prototype, 'broadcastGameComplete', broadcastGameComplete);
inflate(Game.prototype, 'broadcastGuess', broadcastGuess);
inflate(Game.prototype, 'broadcastGameStart', broadcastGameStart);
inflate(Game.prototype, 'broadcastHangmanState', broadcastHangmanState);
inflate(Game.prototype, 'broadcastPlayerJoin', broadcastPlayerJoin);
inflate(Game.prototype, 'broadcastWordState', broadcastWordState);
inflate(Game.prototype, 'broadcastGuesserUpdate', broadcastGuesserUpdate);
inflate(Game.prototype, 'acceptPlayer', acceptPlayer);
