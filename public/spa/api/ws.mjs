let ws = undefined;

const messagesHandlers = {
    "Accepted": function(data){
     
    }
};

function messageHandler(){

}

export function connectToGameWs(gameCode){

    ws = new WebSocket(`${location.href.replace("http", "ws")}`);

    ws.onmessage = (ev) =>{
        let messageData = JSON.parse(ev.data);
        console.log(messageData);
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