let ws = new WebSocket(`${location.href.replace("http", "ws")}`);

const messagesHandles = {};

function messageHandler(){

}

function connectToGameWs(gameCode){
    ws.onmessage = (ev) =>{
        console.log("ON MESSAGE");
        let messageData = JSON.parse(ev.data);
        if(messageData)
    };

    ws.onopen = () =>{
        console.log("Connected!");
    };
    ws.send(JSON.stringify({
        "message": "Join",
        "payload": {
            "name": gameCode
        }
    }));
}