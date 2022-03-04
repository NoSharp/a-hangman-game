import { makeGuess } from '../api/ws.mjs';

const keyMapping = {};

function createCharacterElementForCharacter(content) {
  const char = document.createElement('div');
  if (char === undefined) {
    alert('Failed to create element, please try refreshing the page.');
    return undefined;
  }

  char.className = 'char';
  char.textContent = content;
  return char;
}

export function setWordToGuess(word) {
  const wordStatusElement = document.querySelector('.word-status');
  if (wordStatusElement.children.length === word.length) {
    for (let idx = 0; idx < wordStatusElement.children.length; idx++) {
      wordStatusElement.children[idx].innerText = word.charAt(idx);
    }
  } else {
    for (const char of word) {
      const button = createCharacterElementForCharacter(char);
      wordStatusElement.append(button);
    }
  }
}

export function addPlayerToList(playerName) {
  const targetElement = document.querySelector('.player-list');
  // Stop the h4x0rz using xss on this amazing game.
  const name = document.createTextNode(playerName);
  targetElement.appendChild(name);
}

export function showHangmanPart(partNum) {
  const hangmanElemnt = document.querySelector(`#hangman-${partNum}`);
  hangmanElemnt.setVisible(true);
}

export function setCoverKeyboardText(msg) {
  const noGuessingPrompt = document.querySelector('.notguessing');
  const noGuessingValue = document.querySelector('.notguessing>h1');
  noGuessingValue.innerText = msg;
  noGuessingPrompt.setVisible(true);
}

export function showKeyboard() {
  const noGuessingPrompt = document.querySelector('.notguessing');
  noGuessingPrompt.setVisible(false);
}

export function setCharactersGuessed(char) {
  keyMapping[char].makeInactive();
}


const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function createKeyButton(key) {
  const button = document.createElement('button');
  if (button === undefined) {
    alert('Failed to create element, please try refreshing the page.');
    return undefined;
  }
  button.makeInactive = function () {
    this.classList.add('key-used');
    // console.log("INACTIVE!!!", this, this.style);
  };

  button.addEventListener('click', () => {
    makeGuess(button.innerText);
  });

  button.className = 'key';
  button.textContent = key;
  return button;
}


function generateKeys() {
  const keysElement = document.querySelector('.keyboard>.keys');

  for (const char of alphabet) {
    const button = createKeyButton(char);
    keyMapping[char] = button;
    keysElement.append(button);
  }
}


export function displayGameSection() {
  document.querySelector('.game-container').setVisible(true);
  document.querySelector('.home-container').setVisible(false);
  generateKeys();
  // setWordToGuess("flood");
}
