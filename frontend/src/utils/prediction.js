export function probabilityPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

export function probabilityFixed(value) {
  return `${(((value || 0) * 100)).toFixed(1)}%`;
}

export function scoreLabel(prediction) {
  if (!prediction?.most_likely_score) return "TBD";
  return `${prediction.most_likely_score.team_a_goals}-${prediction.most_likely_score.team_b_goals}`;
}

export function getPredictionWinner(prediction) {
  return prediction?.winner || "TBD";
}

export function teamOptionsFromFixture(fixture) {
  return [fixture.teamA, fixture.teamB];
}
