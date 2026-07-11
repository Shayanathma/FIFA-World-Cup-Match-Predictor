export const quarterFinalFixtures = [
  { id: "qf1", teamA: "France", teamB: "Morocco", label: "Quarter-final 1" },
  { id: "qf2", teamA: "Belgium", teamB: "Spain", label: "Quarter-final 2" },
  { id: "qf3", teamA: "England", teamB: "Norway", label: "Quarter-final 3" },
  { id: "qf4", teamA: "Argentina", teamB: "Switzerland", label: "Quarter-final 4" },
];

export const semiFinalSlots = [
  {
    id: "sf1",
    label: "Semi-final 1",
    sources: ["qf1", "qf2"],
  },
  {
    id: "sf2",
    label: "Semi-final 2",
    sources: ["qf3", "qf4"],
  },
];

export const flagByTeam = {
  Argentina: "🇦🇷",
  Belgium: "🇧🇪",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Morocco: "🇲🇦",
  Norway: "🇳🇴",
  Spain: "🇪🇸",
  Switzerland: "🇨🇭",
};

export function fixtureTeams(fixture) {
  return [fixture.teamA, fixture.teamB];
}
