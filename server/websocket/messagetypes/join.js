import { gameExists } from "../../game/game.js";
import {isValidJoinRequest} from "../requestValidation.js";

export const messageName = "Join";

export function onMessage(ws, data){
    
    if(!isValidJoinRequest(data)){
        ws.sendInvalidResponse("Invalid Join Body");
        return;
    }

    if(!gameExists(data.name)){
        ws.sendResponse("Kick", {
            "reason": "NO_GAME_FOUND"
        });
        return;
    }

    // Send an accepted response
    ws.sendResponse("Accepted",{})
    
}