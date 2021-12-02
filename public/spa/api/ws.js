
let ws = new WebSocket(`${location.href.replace("http", "ws")}`);

function connectToGameWs(gameCode){
    ws.onmessage = console.log;
    ws.send(JSON.stringify({
        "message": "Join",
        "payload": {
            "name": gameCode
        }
    }))
}