export class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }

  static fromDTO(playerObj) {
    const player = new Player(playerObj.name, playerObj.id);
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
