// TODO: refactor naming convention of the packet identifier.
// TODO: add inverse of the packet identifer map.
// TODO: make synchronise part of the acceptance packet.
// TODO: add some sort of idenfitifer for packet direction.
export const PacketIdentifiers = new Map([
  ['Reject', 0],
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
