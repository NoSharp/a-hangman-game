import express from "express";
import ws from "ws";
import { cookieMiddlewear } from "./cookieHelper.js";
import gameRouter from "./routes/api/game.js";

const app = express();

app.use(express.json());

app.use(express.static("public/spa"))

app.use(cookieMiddlewear);

app.use("/api/game/", gameRouter);

app.listen(8080, ()=>{
    console.log("Yo we listening.");
});