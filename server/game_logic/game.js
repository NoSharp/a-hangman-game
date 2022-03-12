// 🎷🐛

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
    player.generateDTO();
    this.broadcastPlayerJoin();
    if (this.players.length >= this.roomSize) {
      this.startGame();
    }
    return player;
  }

  startGame() {
    this.setCurrentGuesserId(0);
  }

  canGuessLetter(letter) {
    return this.guessedCharacters[letter] === undefined;
  }

  canPlayerGuess(player) {
    return this.currentGuesserId === player.id;
  }

  setCurrentGuesserId(id) {
    this.currentGuesserId = id;
    const player = this.players.get(this.currentGuesserId);
    this.broadcastPayloadToClients('Guesser', {
      id: player.id,
    });
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
    this.broadcastPayloadToClients('GameComplete', {
      winningTeam: this.didSetterWin() ? 'CPU' : 'PLAYERS',
    });

    for (const player of this.players) {
      player.closeWebSocket();
    }

    // Remove all of the possibly reference counted properties
    // of the object to make sure it's GC'd.
    // Over kill, but w/e.
    delete this.players;

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


  broadcastGuess(char, wasGuessCorrect) {
    this.broadcastPayloadToClients('Guess', {
      guessedCharacter: char,
      correct: wasGuessCorrect,
    });
  }

  broadcastHangmanState() {
    this.broadcastPayloadToClients('HangManState', this.generateHangmanDTO());
  }

  broadcastWordState() {
    this.broadcastPayloadToClients('WordState', this.generateWordStateDTO());
  }

  broadcastPlayerJoin() {
    this.broadcastPayloadToClients('PlayerJoin', this.generatePlayersDTO());
  }

  /**
   * Converts the game data into a data transfer object
   * Used on Synchronise requests sent by the client.
   * @returns {Object} The payload to send to the client
   */
  generateDTO() {
    return {
      code: this.code,
      roomSize: this.roomSize,
      wordState: this.generateWordStateDTO(),
      hangmanState: this.hangmanState,
      players: this.generatePlayersDTO(),
    };
  }

  /**
   *
   * @returns {Object} the hangman state
   */
  generateHangmanDTO() {
    return {
      hangmanState: this.hangmanState,
    };
  }

  generatePlayersDTO() {
    const players = {};

    for (const [id, player] of this.players.entries()) {
      console.log(player);
      players[id] = player.generateDTO();
    }

    return players;
  }

  generateWordStateDTO() {
    return {
      currentWordState: this.currentWordState,
    };
  }

  generateGuessedCharactersDTO() {
    const guessedChars = [];
    for (const val of this.guessedCharacters.keys()) {
      guessedChars.push(val);
    }
    return guessedChars;
  }

  broadcastPayloadToClients(name, payload) {
    this.players.forEach((ply) => {
      ply.sendPayload(name, payload);
    });
  }
}
