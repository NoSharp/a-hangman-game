import fs from 'fs';
import assert from 'assert';
import path from 'path';
import { __dirname } from './commonJsPassthrough.cjs';

let cachedFile = [];

const wordDir = path.join(__dirname, '../', '../', 'wordslist.txt');

export function parseFile() {
  const promise = new Promise((resolve, reject) => {
    assert(cachedFile.keys.length === 0, 'Cached file is already loaded, but being loaded again.');
    fs.readFile(wordDir, 'utf8', (err, buffer) => {
      if (err != null) {
        reject(err);
        return;
      }
      cachedFile = buffer.split(/[\r\n]+/);

      resolve();
    });
  });
  return promise;
}

export const getWord = (idx) => cachedFile[idx];

export const getRandomWord = () => cachedFile[Math.floor(Math.random() * cachedFile.length)];
