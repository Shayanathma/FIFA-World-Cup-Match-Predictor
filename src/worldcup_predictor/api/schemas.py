from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    team_a: str = Field(..., min_length=1)
    team_b: str = Field(..., min_length=1)

    @field_validator("team_a", "team_b")
    @classmethod
    def strip_team_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Team name cannot be empty.")
        return stripped


class MostLikelyScoreResponse(BaseModel):
    team_a_goals: int
    team_b_goals: int


class RecentFormMatchResponse(BaseModel):
    opponent: str
    result: str
    score: str


class HeadToHeadMatchResponse(BaseModel):
    date: str
    score: str
    winner: str


class PredictionResponse(BaseModel):
    team_a: str
    team_b: str
    winner: str
    win_probability: float
    draw_probability: float
    loss_probability: float
    team_a_expected_goals: float
    team_b_expected_goals: float
    most_likely_score: MostLikelyScoreResponse
    most_likely_score_probability: float
    team_a_recent_form: list[RecentFormMatchResponse]
    team_b_recent_form: list[RecentFormMatchResponse]
    head_to_head: list[HeadToHeadMatchResponse]
