import { isValidMakeGuessRequest } from "../requestValidation.js";
import { gameExists, findGameByRoomCode } from "../../game_logic/game.js";
import { Player } from "../../game_logic/player.js";

export const messageName = "MakeGuess";

export function onMessage(ws, data){
    
    if(!isValidMakeGuessRequest(data)){
        ws.sendInvalidResponse("Invalid Make Guess Body");
        return;
    }
    const game = findGameByRoomCode(ws.getGameCode());
    if(game === undefined) return;

    const player = ws.getPlayerInstance();
    if(player === undefined) return;
    if(!player.canMakeGuess()) return;
    if(!game.canGuessLetter(data.guess)) return;

    game.playerGuessLetter(player, data.guess);

}