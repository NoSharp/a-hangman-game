
function assert(condition, errMessage) {
  if (!condition) {
    throw errMessage;
  }
}

/**
 * Used to manipulate an array of bytes.
 * Utility is trimmed down and only does what we need
 * so no writing or reading floating point numbers etc.
 * I never deal with signed numbers so we only have utilities
 * for dealing with unsigned numbers.
 */
export class BufferWriter {
  constructor() {
    this.buffer = new Uint8Array(1024);
    this.curPos = 0;
  }

  writeChar(char) {
    this.writeInt(char.charCodeAt(0), 1);
  }

  // Write until null termination
  // each string is ascii because we don't need to deal with non-unicode characters.
  writeString(str) {
    const strLength = str.length;

    for (let i = 0; i < strLength; i++) {
      this.writeChar(str[i]);
    }

    this.writeByte(0x00);
  }


  writeBoolean(bool) {
    this.writeInt(bool ? 1 : 0, 1);
  }

  // Write it in little endian format.
  writeInt(num, byteSize) {
    let lastMaxValue = 0;
    // Converts to a 2's complement 32 bit integer
    num = num >>> 0;
    for (let byteIdx = 0; byteIdx < byteSize; byteIdx++) {
      // get our max value for this amount of bits (-1 because we include 0).
      const maxValue = 2 ** ((byteIdx + 1) * 8) - 1;

      // byte pad out if we need to, to avoid writing bytes repeatedly.
      if (maxValue > num && lastMaxValue > num) {
        this.writeByte(0x00);
        continue;
      }

      // Bit shift across 8 bits each iteration,
      // mask the byte, we've just bit shifted then
      // append to our array.
      const byteData = num >> (byteIdx * 8) & 0xFF;
      this.writeByte(byteData);
      lastMaxValue = maxValue;
    }
  }

  writeByte(val) {
    this.buffer[this.curPos] = val;
    this.curPos++;
  }

  getBufferAsString() {
    return String.fromCharCode(...this.buffer);
  }
}

export class BufferReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.curPos = 0;
  }

  static fromString(str) {
    const buffer = new Uint8Array(1024);
    for (let i = 0; i < str.length; i++) {
      buffer[i] = str.charCodeAt(i);
    }
    return new BufferReader(buffer);
  }

  readByte() {
    const byte = this.buffer[this.curPos];
    this.curPos++;
    return byte;
  }

  readChar() {
    return String.fromCharCode(this.readInt(1));
  }

  readBoolean() {
    return this.readInt(1) === 1;
  }

  // Reads until null termination.
  readString() {
    let nullTerminated = false;
    let curStr = '';
    while (!nullTerminated) {
      const char = this.readByte();
      if (char === 0x00 || char == null) {
        nullTerminated = true;
      } else {
        curStr += String.fromCharCode(char);
      }
    }
    return curStr;
  }

  // read little endian of n size bytes.
  readInt(size) {
    let curNumber = 0;
    for (let byteIdx = 0; byteIdx < size; byteIdx++) {
      const byte = this.buffer[this.curPos];
      // bit shift left our byte to convert back from little endian format.
      // use Or= to combine it back into the initial number.
      // Javascript Negative numbers are two's complement anyway.
      curNumber |= byte << (byteIdx * 8);
      this.curPos++;
    }
    return curNumber;
  }
}

export function bitPack(a, b, bBitWidth, totalLength) {
  assert(a >= 0, '[b] only unsigned numbers can be bit-packed.');
  assert(b >= 0, '[a] only unsigned numbers can be bit-packed.');

  const amountToShiftA = totalLength - bBitWidth;
  return a << amountToShiftA | b;
}

export function unBitPack(num, bBitWidth, totalLength) {
  const amountToShiftA = totalLength - bBitWidth;
  const aBitMask = 2 ** amountToShiftA - 1;
  const bBitMask = 2 ** bBitWidth - 1;
  return [(num >> amountToShiftA & bBitMask), num & aBitMask];
}

const buffer = new BufferWriter();
buffer.writeInt(120, 1);
buffer.writeString('Testing123');
const bfread = BufferReader.fromString(buffer.getBufferAsString());
console.log(bfread.readInt(1));
console.log(bfread.readString());
// Benchmarking serialization.
// JSON most likely will be more efficient than the results of the benchmark
// in practice due  to how v8 handles objects. JSON.parse was used to force
// javascript to re-compile the object and avoid any compiler optimisations.

/*
let beforeDate = Date.now();
let b;
for(let i = 0; i < 100000; i++){
  let jsonStr = JSON.parse(`{
    "hangmanState": 7,
    "guessedCharacters": ["a","b","c"],
    "currentWordState": "FL OD",
    "players": [
      {
        "id": 1,
        "name": "testtt"
      },
      {
        "id": 2,
        "name": "testtt"
      },
      {
        "id": 3,
        "name": "testtt"
      }
    ],
    "currentGuesser": 1
  }`);
  b = JSON.stringify(jsonStr);
}
console.log(`JSON stringify: ${(Date.now() - beforeDate)}ms Size: ${b.length}b`)

let oldB = b;
beforeDate = Date.now();

for(let i = 0; i < 100000; i++){
  let buffer = new BufferWriter();
  buffer.writeInt(bitPack(7, 3, 5, 8), 1);
  buffer.writeString('abc');
  buffer.writeString('FL OD');
  for(let i = 0; i < 3; i++){
    buffer.writeInt(i+1, 1);
    buffer.writeString("testtt");
  }
  buffer.writeInt(1,1);
  b = buffer.getBufferAsString();

}
console.log(`buffer: ${(Date.now() - beforeDate)}ms Size: ${b.length}b`);
console.log(`Buffer is ${ 100 - Math.floor((b.length/oldB.length) * 100) }% less than JSON`);
*/
