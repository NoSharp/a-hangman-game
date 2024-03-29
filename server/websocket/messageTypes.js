import path from 'path';
import { readdirSync } from 'fs';
import { __dirname } from './commonJsPassthrough.cjs';

const basePath = path.join(__dirname, 'messagetypes');

const contents = readdirSync(basePath);

// I belive for readability it's easier if we use
// let for the object/kv data structure, as it signifies mutability.
// Where as const will not.
const types = {};

for (const fPath of contents) {
  import('./messagetypes/' + fPath)
    .then((data) => {
      types[data.messageName] = data.onMessage;
      console.log('Loaded message: ', data.messageName);
    });
}

/**
 * Gets the actioner method for a type.
 * @param {string} type
 */
export function getActioner(type) {
  return types[type];
}
