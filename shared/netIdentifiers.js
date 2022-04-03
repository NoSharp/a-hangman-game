export const PacketIdentifiers = [
  // Login/Handshake
  'C2SJoin',
  'S2CAccepted',
  // In-Game Packets
  'S2COnGameStarted',
  'C2SMakeGuess',
  'S2CGuessMade',
  'S2CWordStateUpdate',
  'S2CHangmanStateUpdate',
  'S2CGuesserUpdate',
  'S2COnPlayerJoin',

  'S2COnGameComplete',
];

export const PacketLookup = new Map();

for (let i = 0; i < PacketIdentifiers.length; i++) {
  PacketLookup.set(PacketIdentifiers[i], i);
}
export function getPacketName(num) {
  return PacketIdentifiers[num];
}

export function getPacketId(packetName) {
  return PacketLookup.get(packetName);
}
