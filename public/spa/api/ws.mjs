let ws = undefined;

let shouldRenderOnNextGameInfo = false;

let currentGameInfo = {};

const messageHandlers = {
    
    "Accepted": function(data){
        shouldRenderOnNextGameInfo = true;
    },

    "GameInfo": function(data){
        currentGameInfo = data.payload;
        if(!shouldRenderOnNextGameInfo){
            return;
        }

        

    }
};

export function connectToGameWs(gameCode){

    ws = new WebSocket(`${location.href.replace("http", "ws")}`);

    ws.onmessage = (ev) =>{
        let messageData = JSON.parse(ev.data);
        console.log(messageData);
        const messageName = messageData.message;
        
        if(messageName === undefined){
            console.log(`Error handling packet: ${ev.data}`);
            return;
        }
        
        if(messageHandlers[messageName] === undefined){
            console.log(`No handler defined for: ${messageName}`);
            return;
        }

        messageHandlers[messageName](messageData.payload);
    };

    ws.onopen = () =>{
            
        ws.send(JSON.stringify({
            "message": "Join",
            "payload": {
                "name": gameCode
            }
        }));
    };

    ws.onerror = (err)=>{
        console.log(err);
    }
}

/**
 * - Single POST request for handling the order placement
 * - API then prompts server (person not machine) to create Ice cream
 * - 
 */