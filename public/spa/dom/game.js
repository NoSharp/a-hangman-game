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

function setWordToGuess(word){
    const keysElement = document.querySelector(".keyboard>.word-status");
    
    for(const char of word){
        const button = createCharacterElementForCharacter(char);
        keysElement.append(button);
    }
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createKeyButton(key){
    const button = document.createElement("button");
    if(button === undefined){
        alert("Failed to create element, please try refreshing the page.");
        return undefined;
    }
    button.setUsed = function(used){
        this.style.backgroundColor = "rgb(35,35,35)";
        this.style.background = "linear-gradient(#00000000, #0000000) !important";
    }

    button.className = "key";
    button.textContent = key;
    return button;
}


function generateKeys() {
    const keysElement = document.querySelector(".keyboard>.keys");
    
    for(const char of alphabet){
        const button = createKeyButton(char);
        button.setUsed(true);
        keysElement.append(button);
    }
}