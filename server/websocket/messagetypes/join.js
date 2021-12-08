import {isValidJoinRequest} from "../requestValidation.js";

export const messageName = "Join";

export function onMessage(ws, data){
    
    if(!isValidJoinRequest(data)){
        ws.sendInvalidResponse("Invalid Join Body");
        return;
    }

    
}