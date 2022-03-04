export class Player {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  getName() {
    return this.name;
  }

  getRole() {
    return this.role;
  }

  setRole(role) {
    this.role = role;
  }

  static fromDTO(playerObj) {
    const player = new Player(playerObj.name, playerObj.role);
    return player;
  }
}

export const Role = {
  /**
     * The person currently guessing a letter.
     */
  GUESSING: 0,
  /**
   * The person not currently guessing.
   */
  IDLE: 1,
  /**
   * Whoever created the word for that round,
   * depends on game mode.
   */
  WORD_MAKER: 2,
};

export function getRoleFromNetwork(networkedNum) {
  switch (networkedNum) {
    case 0:
      return Role.GUESSING;
    case 1:
      return Role.IDLE;
    case 2:
      return Role.WORD_MAKER;
    default:
      return undefined;
  }
}

export function getNameFromRole(role) {
  switch (role) {
    case 0:
      return 'Guessers';
    case 1:
      return 'Idles';
    case 2:
      return 'Word Makers';
    default:
      return 'UNKNOWN';
  }
}
