import { displayGameSection, setWordToGuess, setCharactersGuessed, setCoverKeyboardText, showHangmanPart, showKeyboard } from '../dom/game.mjs';
import { Role, getNameFromRole, Player } from '../game_logic/game.mjs';

//TODO: FIX, store player info correcty
// as it's now ID based, plus this entire storage mechanism is messy.
let ws;

let shouldRenderOnNextGameInfo = false;

let currentGameInfo = {};

let players = {};

let currentUserName = '';
let currentId = 0;
function getCurrentWordState() {
  return currentGameInfo?.wordState?.currentWordState ?? '';
}

function updateWordState() {
  setWordToGuess(getCurrentWordState());
  const chars = currentGameInfo.wordState.guessedCharacters;
  for (let idx = 0; idx < chars.length; idx++) {
    setCharactersGuessed(chars[idx]);
  }
}

function updateHangmanState() {
  const curState = currentGameInfo.hangmanState;
  for (let i = 1; i <= curState; i++) {
    showHangmanPart(i);
  }
}

function ensurePlayersMap() {
  if (typeof (currentGameInfo.players) === 'object' && currentGameInfo.players.keys === undefined) {
    currentGameInfo.players = new Map(Object.entries(currentGameInfo.players));
  }
}

function runPlayerUpdate() {
  ensurePlayersMap();

  const curPlayers = currentGameInfo.players ?? new Map();
  players = {};
  let isGuessingThisRound = true;
  for (const playerIdx of curPlayers.keys()) {
    const player = curPlayers.get(playerIdx);
    const plyObj = Player.fromDTO(player);

    players[plyObj.getName()] = plyObj;
    if (plyObj.getName() !== currentUserName && plyObj.getRole() === Role.GUESSING) {
      setCoverKeyboardText(`${plyObj.getName()} is currently guessing`);
      isGuessingThisRound = false;
    }
  }

  if (isGuessingThisRound) {
    showKeyboard();
  }
}


const messageHandlers = {

  Accepted: function (data) {
    shouldRenderOnNextGameInfo = true;
    // TODO: Bug regression here. We need to set a name from the server.
    currentUserName = data.name;
    currentId = data.id;
    console.log(currentUserName);
  },

  Synchronise: function (data) {
    currentGameInfo = data;

    if (shouldRenderOnNextGameInfo) {
      displayGameSection();
      shouldRenderOnNextGameInfo = false;
    }

    setWordToGuess(getCurrentWordState());
    updateWordState();
    updateHangmanState();
    runPlayerUpdate();
  },

  WordState: function (data) {
    currentGameInfo.wordState = data;
    updateWordState();
  },

  Guess: function (data) {
    // TODO: Actually do something here.
    setCharactersGuessed(data.guessedCharacter);
  },
  Guesser: function (data) {
    // TODO: Actually do something here.
    if (data.id !== currentId) {
      setCoverKeyboardText(`${data.name} is currently guessing`);
    } else {
      showKeyboard();
    }
  },
  GameComplete: function (data) {
    setCoverKeyboardText(`${getNameFromRole(data.winningTeam)} Won the game`);
  },

  HangManState: function (data) {
    currentGameInfo.hangmanState = data.hangmanState;
    updateHangmanState();
  },

  PlayerJoin: function (data) {
    currentGameInfo.players = data;
    runPlayerUpdate();
  },

  PlayerData: function (data) {
    if (data.name !== currentUserName && data.role === Role.GUESSING) {
      setCoverKeyboardText(`${data.name} is currently guessing`);
    } else {
      showKeyboard();
    }
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
