/* eslint-disable import/no-absolute-path */
/* eslint-disable import/no-unresolved */

import { BufferReader, BufferWriter, unBitPack } from '/buffer.js';
import { getPacketName, getPacketId } from '/netIdentifiers.js';
import { getTeamName } from '/teamIdentifiers.js';

import { displayGameSection, setWordToGuess, setCharactersGuessed, setCoverKeyboardText, showHangmanPart, showKeyboard } from '../dom/game.mjs';
import { Player } from '../game_logic/game.mjs';

let ws;

let shouldRenderOnNextSynchronise = false;

let currentWordState = '';
let currentGuesserId = 0;
let currentHangmanState = 0;
let gameStarted = false;

const guessedCharacters = [];
const players = new Map();

let currentUserName = '';
let currentId = 0;

function updateWordState() {
  setWordToGuess(currentWordState);
}

function updateHangmanState(hangmanState) {
  currentHangmanState = hangmanState;
  const curState = currentHangmanState;
  for (let i = 1; i <= curState; i++) {
    showHangmanPart(i);
  }
}

function handleGuesserChange() {
  if (!gameStarted) return;
  if (currentId !== currentGuesserId) {
    setCoverKeyboardText(`${players.get(currentGuesserId).name} is currently guessing`);
  } else {
    showKeyboard();
  }
}

const messageHandlers = {

  S2CAccepted: function (data) {
    shouldRenderOnNextSynchronise = true;
    const player = Player.fromBuffer(data);
    currentUserName = player.name;
    currentId = player.id;
    players.set(currentId, new Player(currentUserName, currentId));
  },

  S2CSynchronise: function (data) {
    let playerCount = 0;
    [currentHangmanState, playerCount] = unBitPack(data.readInt(1), 5, 8);

    currentWordState = data.readString();
    let curChar = data.readChar();
    while (curChar !== String.fromCharCode(0x00) && curChar !== undefined) {
      guessedCharacters.push(curChar);
      curChar = data.readChar();
    }

    for (let idx = 0; idx < playerCount; idx++) {
      const id = data.readInt(1);
      const name = data.readString();
      console.log('adding player: ', id, name);
      players.set(id, new Player(name, id));
    }

    if (shouldRenderOnNextSynchronise) {
      displayGameSection();
      shouldRenderOnNextSynchronise = false;
    }
    setWordToGuess(currentWordState);
    updateWordState();
    updateHangmanState(currentHangmanState);
    handleGuesserChange();
  },

  S2CWordStateUpdate: function (data) {
    currentWordState = data.readString();
    console.log(currentWordState);
    setWordToGuess(currentWordState);
  },

  S2CGuessMade: function (data) {
    const char = data.readChar();
    // was guess correct?
    data.readBoolean();
    guessedCharacters.push(char);
    setCharactersGuessed(char);
  },

  S2CGuesserUpdate: function (data) {
    currentGuesserId = data.readInt(1);
    console.log(currentGuesserId);
    handleGuesserChange();
  },

  S2COnGameComplete: function (data) {
    setCoverKeyboardText(`${getTeamName(data.readInt(1))} Won the game`);
  },

  S2CHangmanStateUpdate: function (data) {
    updateHangmanState(data.readInt(1));
  },

  S2COnPlayerJoin: function (data) {
    const player = Player.fromBuffer(data);
    console.log('player joined!', player.name);
    players.set(player.id, player);
    handleGuesserChange();
  },

  S2COnGameStarted: function () {
    gameStarted = true;
    handleGuesserChange();
  },
};


export function connectToGameWs(roomCode) {
  ws = new WebSocket(`${location.href.replace('http', 'ws')}`);

  setCoverKeyboardText('Waiting for game to start');

  ws.onmessage = (ev) => {
    const readBuffer = BufferReader.fromString(ev.data);
    const packetId = readBuffer.readInt(1);
    const messageName = getPacketName(packetId);
    // console.log(`RECV: ${packetId}(${messageName})`);
    if (messageName === undefined) {
      console.log(`Error handling packet: ${ev.data}`);
      return;
    }

    if (messageHandlers[messageName] == null) {
      console.log(`No handler defined for: ${messageName}`);
      return;
    }
    messageHandlers[messageName](readBuffer);
  };

  ws.onopen = () => {
    const buffer = new BufferWriter();
    buffer.writeInt(getPacketId('C2SJoin'), 1);
    buffer.writeString(roomCode);
    ws.send(buffer.getBufferAsString());
  };

  ws.onerror = (err) => {
    console.log(err);
  };
}

export function makeGuess(char) {
  const buffer = new BufferWriter();
  buffer.writeInt(getPacketId('C2SMakeGuess'), 1);
  buffer.writeChar(char);
  ws.send(buffer.getBufferAsString());
}

export function setName(name) {
  currentUserName = name;
}

export function getName() {
  return currentUserName;
}


// TODO: Handle disconnection and no one being in the game correctly.
