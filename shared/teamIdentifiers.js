export const TeamIdentifiers = new Map([
  ['CPU', 0],
  ['PLAYERS', 1],
]);

export function getTeamName(num) {
  for (const [key, value] of TeamIdentifiers.entries()) {
    if (value === num) {
      return key;
    }
  }
}
