
let ws = new WebSocket(`${location.href.replace("http", "ws")}`);

function connectToGame(gameCode){
    ws.onmessage = console.log;
}