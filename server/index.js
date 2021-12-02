import express from "express";
import {WebSocketServer} from "ws";
import { cookieMiddlewear, requestHasCookie } from "./cookieHelper.js";
import gameRouter from "./routes/api/game.js";
import http from "http";

const app = express();

const httpServer = http.createServer(app);

const wss = new WebSocketServer({
    noServer: true
});

app.use(express.json());

app.use(express.static("public/spa"))

app.use(cookieMiddlewear);

app.use("/api/game/", gameRouter);

const cookieRegex = /([^gameCookie=].*[^;])/g;

httpServer.on('upgrade', (req, socket, head) => {
    console.log("got here?");
    if((req.headers?.upgrade ?? "") !== "websocket"){
        socket.write(`HTTP/1.1 401 Unauthorized \r\n\r\n`);
        socket.destroy();
        return;
    }

    const cookie = req.headers?.cookie ?? "";
    const matched = cookie.match(cookieRegex)[0];

    if(matched === undefined){
        socket.write(`HTTP/1.1 401 Unauthorized \r\n\r\n`);
        socket.destroy();
        return;
    }

    wss.handleUpgrade(req, socket, head, (client, req) => wss.emit("connection", client, req));
});

wss.on("connection", (ws, req) => {
    console.log("WS connected. 123! ");
})

httpServer.listen(8080, ()=>{
    console.log("On!");
});
