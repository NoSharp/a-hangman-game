import { randomInt } from 'crypto';
import { createReadStream } from 'fs';
import path from 'path';
import { MessageChannel } from 'worker_threads';
import { __dirname } from './commonJsPassthrough.cjs';
/**
 * @type {readStream?}
 */
let readStream;

export function init() {
  const worker = new Worker(path.join(__dirname, 'wordListWorker.js'));
  const messageChannel = new MessageChannel();
  worker.postMessage({ wordLength: 3, cookie: randomInt() }, [messageChannel.port1]);
}

/**
 * Sends a message to the worker thread
 * inorder to get the words concurrently.
 * @param {number} wordAmount
 * @returns {Promise<string[wordAmount]>} the result of the function.
 */
export function getWordSelection() {
  if (readStream !== undefined) {
    readStream.close();
  }

  readStream = readStream ?? createReadStream(`${__dirname}/../../wrodslist.txt`);
//   const promise = new Promise((resolve, reject) => {
//     readStream.on('readable', () => {
//       readStream.read();
//     });
//   });
}
