// TODO: refactor naming convention of the packet identifier.
// TODO: add inverse of the packet identifer map.
// TODO: make synchronise part of the acceptance packet.
// TODO: add some sort of idenfitifer for packet direction.
export const PacketIdentifiers = [
  'C2SJoin',
  'S2CAccepted',
  'S2CWordState',
  'S2CGuess',
  'S2CHangmanState',
  'S2CPlayerJoin',
  'S2CGuesser',
  'S2CSynchronise',
  'S2CGameComplete',
  'C2SMakeGuess',
  'S2CGameStarted',
];

export const PacketLookup = new Map();

for (let i = 0; i < PacketIdentifiers.length; i++) {
  PacketLookup.set(PacketIdentifiers[i], i);
}

export function getPacketName(num) {
  return PacketIdentifiers[num];
}

export function getPacketId(packetName) {
  return PacketLookup[packetName];
}
