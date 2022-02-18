import { makeGuess } from "../api/ws.mjs";

let keyMapping = {};

function createCharacterElementForCharacter(content){
    const char = document.createElement("div");
    if(char === undefined){
        alert("Failed to create element, please try refreshing the page.");
        return undefined;
    }

    char.className = "char";
    char.textContent = content;
    return char;
}

export function setWordToGuess(word){

    const wordStatusElement = document.querySelector(".word-status");
    if(wordStatusElement.children.length == word.length ){
        for(let idx = 0; idx < wordStatusElement.children.length; idx++){
            wordStatusElement.children[idx].innerText = word.charAt(idx);
        }
    }else{
    
        for(const char of word){
            const button = createCharacterElementForCharacter(char);
            wordStatusElement.append(button);
        }
    }
}

export function addPlayerToList(playerName){
    const targetElement = document.querySelector(".player-list");
    // Stop the h4x0rz using xss on this amazing game.
    const name = document.createTextNode(playerName);
    targetElement.appendChild(name);
}

export function showHangmanPart(partNum){
    const hangmanElemnt = document.querySelector(`#hangman-${partNum}`);
    hangmanElemnt.setVisible(true);
}

export function coverKeyboard(msg){
    const noGuessingPrompt = document.querySelector(".notguessing");
    const noGuessingValue = document.querySelector(".notguessing>h1");
    noGuessingValue.innerText = msg;
    noGuessingPrompt.setVisible(true);
}

export function showKeyboard(){
    const noGuessingPrompt = document.querySelector(".notguessing");
    noGuessingPrompt.setVisible(false);
}

export function setCharactersGuessed(char){
    keyMapping[char].makeInactive();
}


const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createKeyButton(key){
    const button = document.createElement("button");
    if(button === undefined){
        alert("Failed to create element, please try refreshing the page.");
        return undefined;
    }
    button.makeInactive = function(){
        this.classList.add("key-used");
        //console.log("INACTIVE!!!", this, this.style);
    }

    button.addEventListener("click", ()=> {
        makeGuess(button.innerText);
    });

    button.className = "key";
    button.textContent = key;
    return button;
}



function generateKeys() {
    const keysElement = document.querySelector(".keyboard>.keys");
    
    for(const char of alphabet){
        const button = createKeyButton(char);
        keyMapping[char] = button;
        keysElement.append(button);
    }
}

let canvas;
const vh = (y) => canvas.height * (y / 100);
const vw = (x) => canvas.width * (x / 100);

CanvasRenderingContext2D.prototype.drawLine = function (x1,y1,x2,y2){
    this.beginPath()
    this.moveTo(x1,y1);
    this.lineTo(x2,y2);
    this.stroke();
}


CanvasRenderingContext2D.prototype.drawBox = function (x,y,w,h){
    this.beginPath()
    this.moveTo(x,y);
    this.lineTo(x+w,y+h);
    this.stroke();
}

const hangmanStates = [
    function(ctx){
        // Nothing here, don't draw anything.
    },
    function(ctx){
        ctx.lineWidth = 5;
        const marginX = vw(10);
        ctx.drawLine(marginX, vh(90), vw(25), vh(90));
        
        ctx.lineWidth = 5;
        ctx.drawLine(marginX+vw(7.5), vh(90), marginX+vw(7.5), vh(10));

        ctx.lineWidth = 2.5;
        ctx.drawLine(marginX+vw(7.5), vh(10), marginX+vw(7.5)+vw(20), vh(10));

        ctx.drawLine(marginX+vw(7.5)+vw(20), vh(10), marginX+vw(7.5)+vw(20), vh(20));
    },
    function(ctx){
        const hangmanCenter = vw(10)+vw(7.5)+vw(20);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(hangmanCenter, vh(25), vh(10), vh(10), 0, 360, 2*Math.PI);
        ctx.stroke();
    },
    function(ctx){
        const hangmanCenter = vw(10)+vw(7.5)+vw(20);
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.drawLine(hangmanCenter, vh(35), hangmanCenter, vh(65));
        ctx.stroke();
    },
    function(ctx){
        const hangmanCenter = vw(10)+vw(7.5)+vw(20);
        const legOffsetX = vw(5);
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.drawLine(hangmanCenter, vh(65), hangmanCenter+legOffsetX, vh(80));
        ctx.stroke();
    },
    function(ctx){
        const hangmanCenter = vw(10)+vw(7.5)+vw(20);
        const legOffsetX = vw(5);
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.drawLine(hangmanCenter, vh(65), hangmanCenter-legOffsetX, vh(80));
        ctx.stroke();
    },
    function(ctx){
        const hangmanCenter = vw(10)+vw(7.5)+vw(20);
        const legOffsetX = vw(5);
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.drawLine(hangmanCenter, vh(65), hangmanCenter-legOffsetX, vh(80));
        ctx.stroke();
    },
    function(ctx){
        const hangmanCenter = vw(10)+vw(7.5)+vw(20);
        const armLength = vw(5);
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.drawLine(hangmanCenter-armLength, vh(50), hangmanCenter+armLength, vh(50));
        ctx.stroke();
    }
    
]

function getHangmanCanvas(){
    return document.querySelector(".hangman-canvas");
}

function setHangmanState(stage){
    
    if(canvas === undefined){
        canvas = getHangmanCanvas();
        canvas.style.height = canvas.style.width;
    }

    const drawingContext = canvas.getContext("2d");
    const drawFunc = hangmanStates[stage];
    if(drawFunc === undefined){
        console.error("Drawing function was not defined for: ", stage);
        return;
    }
    const oldLineWidth = drawingContext.lineWidth;
    drawingContext.fillStyle = "#FFFFFF";
    drawFunc(drawingContext); 
    drawingContext.lineWidth = oldLineWidth;
}

let currentHangmanState = 0;

function incrementHangmanState(){
    currentHangmanState++;
    setHangmanState(currentHangmanState);
}

function getHangmanState(){
    return currentHangmanState;
}


export function displayGameSection(){
    document.querySelector(".game-container").setVisible(true);
    document.querySelector(".home-container").setVisible(false);
    generateKeys();
    // setWordToGuess("flood");
}