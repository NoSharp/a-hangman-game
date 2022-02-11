import { gameExists, findGameByRoomCode } from "../../game_logic/game.js";
import { Player } from "../../game_logic/player.js";
import {isValidJoinRequest} from "../requestValidation.js";

export const messageName = "Join";

export function onMessage(ws, data){
    
    if(!isValidJoinRequest(data)){
        ws.sendInvalidResponse("Invalid Join Body");
        return;
    }

    const roomCode = data.name;
    if(!gameExists(roomCode)){
        ws.sendResponse("Kick", {
            "reason": "NO_GAME_FOUND"
        });
        return;
    }

    const game = findGameByRoomCode(data.name);

    ws.setGameCode(data.name);
    
    game.addPlayer(new Player(ws, data.playerName))

    // Send an accepted response
    ws.sendResponse("Accepted",{});
    // Send game info.
    ws.sendResponse("GameInfo", game.serializeGameInfo());
}