export const semiFinalFixtures = [
  { id: "sf1", teamA: "France", teamB: "Spain", label: "Semi-final 1" },
  { id: "sf2", teamA: "England", teamB: "Argentina", label: "Semi-final 2" },
];

export const flagByTeam = {
  Argentina: "🇦🇷",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Spain: "🇪🇸",
};

export function fixtureTeams(fixture) {
  return [fixture.teamA, fixture.teamB];
}
