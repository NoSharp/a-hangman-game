export const PacketIdentifiers = new Map([
  ['Kick', 0],
  ['Join', 1],
  ['Accepted', 2],
  ['WordState', 3],
  ['Guess', 4],
  ['HangmanState', 5],
  ['PlayerJoin', 6],
  ['Guesser', 7],
  ['Synchronise', 8],
  ['GameComplete', 9],
  ['MakeGuess', 10],
  ['Join', 11],
  ['GameStarted', 12],
]);

export function getPacketName(num) {
  for (const [key, value] of PacketIdentifiers.entries()) {
    if (value === num) {
      return key;
    }
  }
}
