import {isValidJoinRequest} from "../requestValidation.js";

export const messageName = "Join";

export function onMessage(ws, data){
    console.log("Cool! %s", isValidJoinRequest(data));
}