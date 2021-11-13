

import { Router } from "express";
const router = Router();

router.get("/", (req, res)=>{
    let targetGame = req.query?.room;
    
    // Room parameter is missing and is invalid.
    if(targetGame === undefined){
        res.sendStatus(400);
        return;
    }

});

router.post("/", (req,res)=>{
    let gameName = req.body?.name;
    let playerCount = req.body?.playerCount;
    
    if(gameName === undefined || playerCount === undefined){
        res.status(400).send("Missing Game Name or Player Count.");
        return;
    }

    console.log(gameName, playerCount);
    
    res.send(200);
})

export default router;