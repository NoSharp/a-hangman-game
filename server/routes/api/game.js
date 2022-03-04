import { Router } from 'express';
import { addGame, findGameByRoomCode, gameExists } from '../../game_logic/game.js';
import Ajv from 'ajv';

const ajv = new Ajv();

const router = Router();

router.get('/', (req, res) => {
  const targetGame = req.query?.room;

  // Room parameter is missing and is invalid.
  if (targetGame === undefined) {
    res.sendStatus(400);
    return;
  }

  if (!gameExists(targetGame)) {
    res.sendStatus(404);
    return;
  }

  res.sendStatus(200);// JSON.stringify(findGameByRoomCode(targetGame)))
});

const postSchemaValidator = ajv.compile({
  type: 'object',
  properties: {
    playerCount: {
      type: 'number',
    },
    roomCode: {
      type: 'string',
    },
    computerGeneratedWord: {
      type: 'boolean',
    },
  },
  required: [
    'playerCount',
    'roomCode',
    'computerGeneratedWord',
  ],
});


router.post('/', (req, res) => {
  const roomCode = req.body?.roomCode;
  const playerCount = req.body?.playerCount;
  const isComputerGeneratedGame = req.body?.computerGeneratedWord;

  if (!postSchemaValidator(req.body)) {
    res.status(400).send('invalid request body.');
    return;
  }

  if (findGameByRoomCode(roomCode) !== undefined) {
    res.status(400).send('Game Name already exists');
    return;
  }

  addGame(roomCode, playerCount, isComputerGeneratedGame);
  res.sendStatus(200);
});

export default router;
