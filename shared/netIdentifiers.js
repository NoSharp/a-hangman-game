// TODO: make synchronise part of the acceptance packet.
export const PacketIdentifiers = [
  'C2SJoin',
  'S2CAccepted',
  'S2CWordStateUpdate',
  'S2CGuessMade',
  'S2CHangmanStateUpdate',
  'S2COnPlayerJoin',
  'S2CGuesserUpdate',
  'S2CSynchronise',
  'S2COnGameComplete',
  'C2SMakeGuess',
  'S2COnGameStarted',
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
