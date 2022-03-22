export class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }

  static fromBuffer(buffer) {
    const id = buffer.readInt(1);
    const name = buffer.readString();
    const player = new Player(name, id);
    return player;
  }
}

const teamLookup = {
  CPU: 'Computer',
  PLAYERS: 'Players',
};

export function getTeamName(teamIdentifier) {
  return teamLookup[teamIdentifier] ?? 'Unknown';
}
