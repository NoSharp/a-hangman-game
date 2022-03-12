/**
 * Used to manipulate an array of bytes.
 * Utility is trimmed down and only does what we need
 * so no writing or reading floating point numbers etc.
 * I never deal with signed numbers so we only have utilities
 * for dealing with unsigned numbers.
 */

export class Buffer {
  constructor() {
    this.buffer = [];
    this.curPos = 0;
  }

  readByte() {
    const byte = this.buffer[this.curPos];
    this.curPos++;
    return byte;
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

  writeChar(char) {
    this.writeInt(char.charCodeAt(0), 1);
  }

  // Write until null termination
  // each string is ascii because we don't need to deal with non-unicode characters.
  writeString(str) {
    for (const char of str) {
      this.writeChar(char);
    }
    this.buffer.push(0x00);
  }

  // Write it in little endian format.
  writeInt(num, byteSize) {
    let lastMaxValue = 0;
    // we get the 2's complement unsigned form of the number
    num = num >>> 0;
    for (let byteIdx = 0; byteIdx < byteSize; byteIdx++) {
      // get our max value for this amount of bits (-1 because we include 0).
      const maxValue = 2 ** ((byteIdx + 1) * 8) - 1;

      // byte pad out if we need to, to avoid writing bytes repeatedly.
      if (maxValue > num && lastMaxValue > num) {
        this.buffer.push(0x00);
        continue;
      }

      // Bit shift across a 8 bits each iteration,
      // mask the byte, we've just bit shifted then
      // append to our array.
      const byteData = num >> (byteIdx * 8) & 0xFF;
      // console.log(byteData);
      this.buffer.push(byteData);
      lastMaxValue = maxValue;
    }
    console.log(this.buffer);
  }

  // read little endian of n size bytes.
  readInt(size) {
    let curNumber = 0;
    for (let byteIdx = 0; byteIdx < size; byteIdx++) {
      const byte = this.buffer[this.curPos];
      // bit shift left our byte to convert back from little endian format.
      // use Or= to combine it back into the initial number.
      // Javascript deals with the two's complement for us.
      curNumber |= byte << (byteIdx * 8);
      this.curPos++;
    }
    return curNumber;
  }
}


// const buffer = new Buffer();
// const t1 = -2147483647;
// const t2 = 2147483647;
// buffer.writeInt(t1, 4);
// buffer.writeInt(t2, 4);
// buffer.writeString('HELLO WORLD!');
// const num1 = buffer.readInt(4);
// const num2 = buffer.readInt(4);
// console.log(buffer.readString());
// console.log(t2, num2);
// console.log(num1, num2, num1 === t1, num2 === t2);
