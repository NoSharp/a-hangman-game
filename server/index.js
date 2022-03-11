import { WebSocketServer } from 'ws';
import { cookieMiddlewear } from './cookieHelper.js';
import { mountWebSocketManager } from './websocket/websocket.js';
import { parseFile } from './utils/wordList.js';

import gameRouter from './routes/api/game.js';
import http from 'http';
import express from 'express';

const app = express();

const httpServer = http.createServer(app);

const wss = new WebSocketServer({
  noServer: true,
});

app.use(express.json());

app.use(express.static('public/spa'));

app.use(cookieMiddlewear);

app.use('/api/game/', gameRouter);

const cookieRegex = /([^gameCookie=].*[^;])/g;

httpServer.on('upgrade', (req, socket, head) => {
  if ((req.headers?.upgrade ?? '') !== 'websocket') {
    socket.write('HTTP/1.1 401 Unauthorized \r\n\r\n');
    socket.destroy();
    return;
  }

  const cookie = req.headers?.cookie ?? '';
  const matched = cookie.match(cookieRegex)?.[0] ?? undefined;

  if (matched === undefined) {
    socket.write('HTTP/1.1 401 Unauthorized \r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (client, req) => wss.emit('connection', client, req));
});

(async () => {
  await parseFile();
  mountWebSocketManager(wss);

  httpServer.listen(8080, () => {
    console.log('Hangman is online.');
  });
})();
