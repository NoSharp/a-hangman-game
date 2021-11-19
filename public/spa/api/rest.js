function createGame(gameName, playerCount){
    const newGameCreate = new XMLHttpRequest();
    newGameCreate.open("POST", `/api/game/`);
    newGameCreate.setRequestHeader("Content-Type", "application/json");
    newGameCreate.send(JSON.stringify({
        name: gameName,
        playerCount: playerCount
    }));
    
}
