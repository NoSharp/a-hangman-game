/* eslint-disable import/no-absolute-path */
/* eslint-disable import/no-unresolved */

import { BufferReader, BufferWriter, unBitPack } from '/buffer.js';
import { getPacketName, PacketIdentifiers } from '/netIdentifiers.js';
import { getTeamName } from '/teamIdentifiers.js';

import { displayGameSection, setWordToGuess, setCharactersGuessed, setCoverKeyboardText, showHangmanPart, showKeyboard } from '../dom/game.mjs';
import { Player } from '../game_logic/game.mjs';

let ws;

let shouldRenderOnNextSynchronise = false;

let currentWordState = '';
let currentGuesserId = 0;
let currentHangmanState = 0;
// eslint-disable-next-line no-unused-vars
let currentRoomSize = 0;

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
  if (currentId !== currentGuesserId) {
    setCoverKeyboardText(`${players.get(currentGuesserId).name} is currently guessing`);
  } else {
    showKeyboard();
  }
}

const messageHandlers = {

  Accepted: function (data) {
    shouldRenderOnNextSynchronise = true;
    const player = Player.fromBuffer(data);
    currentUserName = player.name;
    currentId = player.id;
  },

  Synchronise: function (data) {
    [currentRoomSize, currentHangmanState] = unBitPack(data.readInt(1), 4, 8);
    data.readString();
    currentWordState = data.readString();
    const playerLength = data.readInt(1);
    for (let idx = 0; idx < playerLength; idx++) {
      const id = data.readInt(1);
      const name = data.readString();
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

  WordState: function (data) {
    currentWordState = data.readString();
    setWordToGuess(currentWordState);
  },

  Guess: function (data) {
    const char = data.readChar();
    // was guess correct?
    data.readBoolean();
    guessedCharacters.push(char);
    setCharactersGuessed(char);
  },

  Guesser: function (data) {
    currentGuesserId = data.readInt(1);
    if (currentGuesserId !== currentId) {
      setCoverKeyboardText(`${players.get(currentGuesserId).name} is currently guessing`);
    } else {
      showKeyboard();
    }
  },

  GameComplete: function (data) {
    setCoverKeyboardText(`${getTeamName(data.readInt(1))} Won the game`);
  },

  HangmanState: function (data) {
    updateHangmanState(data.readInt(1));
  },

  PlayerJoin: function (data) {
    const player = Player.fromBuffer(data);
    players.set(player.id, player);
    handleGuesserChange();
  },
};


export function connectToGameWs(roomCode) {
  ws = new WebSocket(`${location.href.replace('http', 'ws')}`);

  ws.onmessage = (ev) => {
    const readBuffer = BufferReader.fromString(ev.data);
    const packetId = readBuffer.readInt(1);
    const messageName = getPacketName(packetId);
    console.log(packetId);
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
    buffer.writeInt(PacketIdentifiers.get('Join'), 1);
    buffer.writeString(roomCode);
    ws.send(buffer.getBufferAsString());
  };

  ws.onerror = (err) => {
    console.log(err);
  };
}

export function makeGuess(char) {
  const buffer = new BufferWriter();
  buffer.writeInt(PacketIdentifiers.get('MakeGuess'), 1);
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
