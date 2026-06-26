import pytest

from worldcup_predictor.model import predict, validate_team


class FakeOutcomeModel:
    def predict_proba(self, features):
        return [[0.2, 0.3, 0.5]]


class FakeScoreModel:
    def predict(self, features):
        elo_diff = float(features.iloc[0]["elo_diff"])
        return [1.8 if elo_diff >= 0 else 0.9]


class FakeBundle:
    model = FakeOutcomeModel()
    score_model = FakeScoreModel()
    feature_names = ["team_elo", "opponent_elo", "elo_diff"]
    teams = ["Argentina", "France"]

    def __init__(self):
        from worldcup_predictor.features import FeatureState

        self.state = FeatureState()
        self.state.elo.ratings["Argentina"] = 1700
        self.state.elo.ratings["France"] = 1600


def test_validate_team_accepts_case_insensitive_match():
    assert validate_team("argentina", ["Argentina", "France"]) == "Argentina"


def test_validate_team_rejects_unknown_with_message():
    with pytest.raises(ValueError, match="Unknown team"):
        validate_team("Atlantis", ["Argentina", "France"])


def test_predict_includes_score_pipeline(monkeypatch):
    monkeypatch.setattr("worldcup_predictor.model.load_bundle", lambda: FakeBundle())

    result = predict("Argentina", "France")

    assert result["win"] == 0.5
    assert result["draw"] == 0.3
    assert result["loss"] == 0.2
    assert result["team_a_expected_goals"] == 1.8
    assert result["team_b_expected_goals"] == 0.9
    assert "likely_team_a_goals" in result
    assert "likely_team_b_goals" in result
