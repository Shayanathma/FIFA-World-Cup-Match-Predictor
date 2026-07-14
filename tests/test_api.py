from fastapi.testclient import TestClient

from worldcup_predictor.api.main import create_app
from worldcup_predictor.services.prediction import (
    HeadToHeadMatch,
    MatchPrediction,
    MostLikelyScore,
    RecentFormMatch,
)


def test_get_teams_endpoint_returns_frontend_teams():
    client = TestClient(create_app())

    response = client.get("/teams")

    assert response.status_code == 200
    assert response.json() == [
        "France",
        "Spain",
        "England",
        "Argentina",
    ]


def test_cors_allows_local_vite_origin():
    client = TestClient(create_app())

    response = client.options(
        "/predict",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"


def test_predict_endpoint_returns_prediction(monkeypatch):
    def fake_predict_match(team_a: str, team_b: str) -> MatchPrediction:
        return MatchPrediction(
            team_a=team_a,
            team_b=team_b,
            winner=team_a,
            win_probability=0.6,
            draw_probability=0.2,
            loss_probability=0.2,
            team_a_expected_goals=1.8,
            team_b_expected_goals=0.8,
            most_likely_score=MostLikelyScore(
                team_a_goals=2,
                team_b_goals=0,
                probability=0.12,
            ),
            team_a_recent_form=[
                RecentFormMatch(
                    opponent="Spain",
                    result="W",
                    score="2-1",
                    date="2024-06-01",
                    competition="Friendly",
                )
            ],
            team_b_recent_form=[
                RecentFormMatch(
                    opponent="Belgium",
                    result="D",
                    score="1-1",
                    date="2024-06-02",
                    competition="UEFA Nations League",
                )
            ],
            head_to_head=[
                HeadToHeadMatch(
                    date="2024-01-01",
                    score="France 2-0 Morocco",
                    winner="France",
                )
            ],
        )

    monkeypatch.setattr(
        "worldcup_predictor.api.routes.prediction_service.predict_match",
        fake_predict_match,
    )
    client = TestClient(create_app())

    response = client.post(
        "/predict",
        json={"team_a": "France", "team_b": "Morocco"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "team_a": "France",
        "team_b": "Morocco",
        "winner": "France",
        "win_probability": 0.6,
        "draw_probability": 0.2,
        "loss_probability": 0.2,
        "team_a_expected_goals": 1.8,
        "team_b_expected_goals": 0.8,
        "most_likely_score": {"team_a_goals": 2, "team_b_goals": 0},
        "most_likely_score_probability": 0.12,
        "team_a_recent_form": [
            {
                "opponent": "Spain",
                "result": "W",
                "score": "2-1",
                "date": "2024-06-01",
                "competition": "Friendly",
            }
        ],
        "team_b_recent_form": [
            {
                "opponent": "Belgium",
                "result": "D",
                "score": "1-1",
                "date": "2024-06-02",
                "competition": "UEFA Nations League",
            }
        ],
        "head_to_head": [
            {
                "date": "2024-01-01",
                "score": "France 2-0 Morocco",
                "winner": "France",
            }
        ],
    }


def test_predict_endpoint_returns_http_error_for_invalid_match(monkeypatch):
    def fake_predict_match(team_a: str, team_b: str) -> MatchPrediction:
        raise ValueError("Choose two different teams.")

    monkeypatch.setattr(
        "worldcup_predictor.api.routes.prediction_service.predict_match",
        fake_predict_match,
    )
    client = TestClient(create_app())

    response = client.post(
        "/predict",
        json={"team_a": "France", "team_b": "France"},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Choose two different teams."}


def test_predict_endpoint_rejects_blank_team_names():
    client = TestClient(create_app())

    response = client.post(
        "/predict",
        json={"team_a": " ", "team_b": "France"},
    )

    assert response.status_code == 422
