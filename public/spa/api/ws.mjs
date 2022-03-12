import { displayGameSection, setWordToGuess, setCharactersGuessed, setCoverKeyboardText, showHangmanPart, showKeyboard } from '../dom/game.mjs';
import { getTeamName, Player } from '../game_logic/game.mjs';

// TODO: FIX, store player info correcty
// as it's now ID based, plus this entire storage mechanism is messy.
let ws;

let shouldRenderOnNextSynchronise = false;

let currentWordState = '';
let currentGuesserId = 0;
let currentHangmanState = 0;

const guessedCharacters = [];
const players = new Map();

let currentUserName = '';
let currentId = 0;

function updateWordState() {
  setWordToGuess(currentWordState);
}

function updateHangmanState() {
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
    currentUserName = data.name;
    currentId = data.id;
  },

  Synchronise: function (data) {
    currentWordState = data.wordState.currentWordState;
    if (shouldRenderOnNextSynchronise) {
      displayGameSection();
      shouldRenderOnNextSynchronise = false;
    }

    setWordToGuess(currentWordState);
    updateWordState();
    updateHangmanState();
    handleGuesserChange();
  },

  WordState: function (data) {
    currentWordState = data.currentWordState;
  },

  Guess: function (data) {
    const char = data.guessedCharacter;
    guessedCharacters.push(char);
    setCharactersGuessed(char);
  },

  Guesser: function (data) {
    currentGuesserId = data.id;
    if (data.id !== currentId) {
      setCoverKeyboardText(`${data.name} is currently guessing`);
    } else {
      showKeyboard();
    }
  },

  GameComplete: function (data) {
    setCoverKeyboardText(`${getTeamName(data.winningTeam)} Won the game`);
  },

  HangManState: function (data) {
    currentHangmanState = data.hangmanState;
    updateHangmanState();
  },

  PlayerJoin: function (data) {
    players.set(data.id, new Player(data.name, data.id));
    handleGuesserChange();
  },
};

export function sendPayload(payloadName, data) {
  ws.send(JSON.stringify({
    message: payloadName,
    payload: data,
  }));
}

export function connectToGameWs(roomCode) {
  ws = new WebSocket(`${location.href.replace('http', 'ws')}`);

  ws.onmessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    const messageName = messageData.message;

    console.log(messageData);
    if (messageName === undefined) {
      console.log(`Error handling packet: ${ev.data}`);
      return;
    }

    if (messageHandlers[messageName] == null) {
      console.log(`No handler defined for: ${messageName}`);
      return;
    }
    messageHandlers[messageName](messageData.payload);
  };

  ws.onopen = () => {
    ws.send(JSON.stringify({
      message: 'Join',
      payload: {
        roomCode,
      },
    }));
  };

  ws.onerror = (err) => {
    console.log(err);
  };
}

export function makeGuess(char) {
  sendPayload('MakeGuess', {
    guess: char,
  });
}

export function setName(name) {
  currentUserName = name;
}

export function getName() {
  return currentUserName;
}


// TODO: Handle disconnection and no one being in the game correctly.
