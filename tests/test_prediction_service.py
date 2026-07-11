import pytest
import pandas as pd

from worldcup_predictor.services import prediction as prediction_service


def _fixture_matches() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "date": pd.Timestamp("2024-01-01"),
                "home_team": "Brazil",
                "away_team": "Argentina",
                "home_score": 1,
                "away_score": 2,
            },
            {
                "date": pd.Timestamp("2024-02-01"),
                "home_team": "Argentina",
                "away_team": "Chile",
                "home_score": 0,
                "away_score": 0,
            },
            {
                "date": pd.Timestamp("2024-03-01"),
                "home_team": "Uruguay",
                "away_team": "Argentina",
                "home_score": 3,
                "away_score": 1,
            },
            {
                "date": pd.Timestamp("2024-04-01"),
                "home_team": "Argentina",
                "away_team": "France",
                "home_score": 2,
                "away_score": 1,
            },
            {
                "date": pd.Timestamp("2024-05-01"),
                "home_team": "Argentina",
                "away_team": "Switzerland",
                "home_score": 1,
                "away_score": 1,
            },
            {
                "date": pd.Timestamp("2024-06-01"),
                "home_team": "Argentina",
                "away_team": "Paraguay",
                "home_score": 4,
                "away_score": 0,
            },
            {
                "date": pd.Timestamp("2024-07-01"),
                "home_team": "Switzerland",
                "away_team": "Germany",
                "home_score": 1,
                "away_score": 0,
            },
            {
                "date": pd.Timestamp("2024-08-01"),
                "home_team": "Switzerland",
                "away_team": "Argentina",
                "home_score": 0,
                "away_score": 2,
            },
            {
                "date": pd.Timestamp("2024-09-01"),
                "home_team": "Spain",
                "away_team": "Switzerland",
                "home_score": 2,
                "away_score": 2,
            },
            {
                "date": pd.Timestamp("2024-10-01"),
                "home_team": "Switzerland",
                "away_team": "France",
                "home_score": 2,
                "away_score": 1,
            },
            {
                "date": pd.Timestamp("2024-11-01"),
                "home_team": "England",
                "away_team": "Switzerland",
                "home_score": 3,
                "away_score": 0,
            },
        ]
    )


def test_get_available_teams_returns_quarter_finalists():
    assert prediction_service.get_available_teams() == [
        "France",
        "Morocco",
        "Spain",
        "Belgium",
        "England",
        "Norway",
        "Argentina",
        "Switzerland",
    ]


def test_predict_match_maps_raw_prediction_to_business_response(monkeypatch):
    monkeypatch.setattr(
        prediction_service,
        "predict",
        lambda team_a, team_b: {
            "team_a": team_a,
            "team_b": team_b,
            "win": 0.55,
            "draw": 0.25,
            "loss": 0.20,
            "team_a_expected_goals": 1.7,
            "team_b_expected_goals": 0.9,
            "likely_team_a_goals": 2,
            "likely_team_b_goals": 1,
            "likely_score_probability": 0.11,
        },
    )
    monkeypatch.setattr(prediction_service, "load_dataset", _fixture_matches)

    prediction = prediction_service.predict_match("Argentina", "Switzerland")

    assert prediction.team_a == "Argentina"
    assert prediction.team_b == "Switzerland"
    assert prediction.winner == "Argentina"
    assert prediction.most_likely_score.team_a_goals == 2
    assert prediction.most_likely_score.team_b_goals == 1
    assert [match.opponent for match in prediction.team_a_recent_form] == [
        "Uruguay",
        "France",
        "Switzerland",
        "Paraguay",
        "Switzerland",
    ]
    assert [match.result for match in prediction.team_a_recent_form] == [
        "L",
        "W",
        "D",
        "W",
        "W",
    ]
    assert prediction.team_a_recent_form[-1].score == "2-0"
    assert [match.date for match in prediction.head_to_head] == [
        "2024-05-01",
        "2024-08-01",
    ]
    assert prediction.head_to_head[0].score == "Argentina 1-1 Switzerland"
    assert prediction.head_to_head[0].winner == "Draw"


def test_predict_match_rejects_team_outside_quarter_finalists():
    with pytest.raises(ValueError, match="Unknown team"):
        prediction_service.predict_match("Brazil", "Argentina")


def test_predict_match_rejects_same_team():
    with pytest.raises(ValueError, match="different teams"):
        prediction_service.predict_match("France", "France")
