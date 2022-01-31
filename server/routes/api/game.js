import { Router, text } from "express";
import { addGame, findGameByRoomCode, gameExists } from "../../game_logic/game.js";
import Ajv from "ajv";

const ajv = new Ajv();

const router = Router();

router.get("/", (req, res)=>{
    let targetGame = req.query?.room;
    
    // Room parameter is missing and is invalid.
    if(targetGame === undefined){
        res.sendStatus(400);
        return;
    }

    if (!gameExists(targetGame)){
        res.sendStatus(404);
        return;
    }

    res.send(JSON.stringify(findGameByRoomCode(targetGame)))
});

const postSchemaValidator = ajv.compile({
    type: "object",
    properties: {
        playerCount: {
            type: "number"
        },
        name: {
            type: "string"
        },
        computerGeneratedWord: {
            type: "boolean"
        }
    },
    required: [
        "playerCount",
        "name",
        "computerGeneratedWord"
    ]
});


router.post("/", (req,res)=>{
    const gameName = req.body?.name;
    const playerCount = req.body?.playerCount;
    const isComputerGeneratedGame = req.body?.computerGeneratedWord;  
    
    if(!postSchemaValidator(req.body)){
        res.status(400).send("invalid request body.");
        return;
    }
        
    if(findGameByRoomCode(gameName) !== undefined) {
        res.status(400).send("Game Name already exists");
        return;
    }

    addGame(gameName, playerCount);
    res.sendStatus(200);
})

export default router;