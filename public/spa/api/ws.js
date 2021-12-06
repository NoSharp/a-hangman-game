
let ws = new WebSocket(`${location.href.replace("http", "ws")}`);

function messageHandler(){

}

function connectToGameWs(gameCode){
    ws.onmessage = (ev) =>{
        console.log("ON MESSAGE");
        console.log(ev);
    };
    ws.onopen = () =>{
        console.log("Connected!");
    }
    ws.send(JSON.stringify({
        "message": "Join",
        "payload": {
            "name": gameCode
        }
    }));
}