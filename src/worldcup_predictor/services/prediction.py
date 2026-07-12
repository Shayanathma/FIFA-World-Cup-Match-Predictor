from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from worldcup_predictor.data import load_dataset
from worldcup_predictor.model import predict, validate_team


FRONTEND_TEAMS = (
    "France",
    "Spain",
    "England",
    "Argentina",
)


@dataclass(frozen=True)
class MostLikelyScore:
    team_a_goals: int
    team_b_goals: int
    probability: float


@dataclass(frozen=True)
class RecentFormMatch:
    opponent: str
    result: str
    score: str


@dataclass(frozen=True)
class HeadToHeadMatch:
    date: str
    score: str
    winner: str


@dataclass(frozen=True)
class MatchPrediction:
    team_a: str
    team_b: str
    winner: str
    win_probability: float
    draw_probability: float
    loss_probability: float
    team_a_expected_goals: float
    team_b_expected_goals: float
    most_likely_score: MostLikelyScore
    team_a_recent_form: list[RecentFormMatch]
    team_b_recent_form: list[RecentFormMatch]
    head_to_head: list[HeadToHeadMatch]


def get_available_teams() -> list[str]:
    return list(FRONTEND_TEAMS)


def _validate_frontend_team(team: str) -> str:
    return validate_team(team, list(FRONTEND_TEAMS))


def _winner_from_probabilities(
    team_a: str,
    team_b: str,
    win_probability: float,
    draw_probability: float,
    loss_probability: float,
) -> str:
    outcomes = (
        (team_a, win_probability),
        ("Draw", draw_probability),
        (team_b, loss_probability),
    )
    return max(outcomes, key=lambda outcome: outcome[1])[0]


def _match_result(team_score: int, opponent_score: int) -> str:
    if team_score > opponent_score:
        return "W"
    if team_score < opponent_score:
        return "L"
    return "D"


def _match_winner(home_team: str, away_team: str, home_score: int, away_score: int) -> str:
    if home_score > away_score:
        return home_team
    if away_score > home_score:
        return away_team
    return "Draw"


def _format_date(value: pd.Timestamp) -> str:
    return value.date().isoformat()


def _recent_form(matches: pd.DataFrame, team: str, limit: int = 10) -> list[RecentFormMatch]:
    team_matches = matches[
        (matches["home_team"] == team) | (matches["away_team"] == team)
    ].sort_values("date")
    recent_matches = team_matches.tail(limit)

    form: list[RecentFormMatch] = []
    for _, match in recent_matches.iterrows():
        is_home = match["home_team"] == team
        team_score = int(match["home_score"] if is_home else match["away_score"])
        opponent_score = int(match["away_score"] if is_home else match["home_score"])
        opponent = str(match["away_team"] if is_home else match["home_team"])
        form.append(
            RecentFormMatch(
                opponent=opponent,
                result=_match_result(team_score, opponent_score),
                score=f"{team_score}-{opponent_score}",
            )
        )
    return form


def _head_to_head(
    matches: pd.DataFrame,
    team_a: str,
    team_b: str,
    limit: int = 5,
) -> list[HeadToHeadMatch]:
    h2h_matches = matches[
        (
            (matches["home_team"] == team_a)
            & (matches["away_team"] == team_b)
        )
        | (
            (matches["home_team"] == team_b)
            & (matches["away_team"] == team_a)
        )
    ].sort_values("date")
    recent_meetings = h2h_matches.tail(limit).sort_values("date", ascending=False)

    meetings: list[HeadToHeadMatch] = []
    for _, match in recent_meetings.iterrows():
        home_team = str(match["home_team"])
        away_team = str(match["away_team"])
        home_score = int(match["home_score"])
        away_score = int(match["away_score"])
        meetings.append(
            HeadToHeadMatch(
                date=_format_date(match["date"]),
                score=f"{home_team} {home_score}-{away_score} {away_team}",
                winner=_match_winner(home_team, away_team, home_score, away_score),
            )
        )
    return meetings


def _prediction_context(team_a: str, team_b: str) -> tuple[
    list[RecentFormMatch],
    list[RecentFormMatch],
    list[HeadToHeadMatch],
]:
    matches = load_dataset()
    return (
        _recent_form(matches, team_a),
        _recent_form(matches, team_b),
        _head_to_head(matches, team_a, team_b),
    )


def predict_match(team_a: str, team_b: str) -> MatchPrediction:
    resolved_team_a = _validate_frontend_team(team_a)
    resolved_team_b = _validate_frontend_team(team_b)
    print("1. Teams validated", flush=True)
    if resolved_team_a == resolved_team_b:
        raise ValueError("Choose two different teams.")

    print("2. Calling model.predict()", flush=True)
    raw_prediction = predict(resolved_team_a, resolved_team_b)
    print("3. Model prediction complete", flush=True)
    winner = _winner_from_probabilities(
        raw_prediction["team_a"],
        raw_prediction["team_b"],
        raw_prediction["win"],
        raw_prediction["draw"],
        raw_prediction["loss"],
    )
    print("4. Building prediction context", flush=True)
    team_a_recent_form, team_b_recent_form, head_to_head = _prediction_context(
        raw_prediction["team_a"],
        raw_prediction["team_b"],
    )
    print("5. Prediction context built", flush=True)

    print("6. Returning MatchPrediction", flush=True)
    return MatchPrediction(
        team_a=raw_prediction["team_a"],
        team_b=raw_prediction["team_b"],
        winner=winner,
        win_probability=raw_prediction["win"],
        draw_probability=raw_prediction["draw"],
        loss_probability=raw_prediction["loss"],
        team_a_expected_goals=raw_prediction["team_a_expected_goals"],
        team_b_expected_goals=raw_prediction["team_b_expected_goals"],
        most_likely_score=MostLikelyScore(
            team_a_goals=raw_prediction["likely_team_a_goals"],
            team_b_goals=raw_prediction["likely_team_b_goals"],
            probability=raw_prediction["likely_score_probability"],
        ),
        team_a_recent_form=team_a_recent_form,
        team_b_recent_form=team_b_recent_form,
        head_to_head=head_to_head,
    )
