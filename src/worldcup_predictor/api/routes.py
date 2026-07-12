from __future__ import annotations

from fastapi import APIRouter, HTTPException

from worldcup_predictor.api.schemas import (
    HeadToHeadMatchResponse,
    MostLikelyScoreResponse,
    PredictionRequest,
    PredictionResponse,
    RecentFormMatchResponse,
)
from worldcup_predictor.services import prediction as prediction_service

router = APIRouter()


@router.get("/teams", response_model=list[str])
def get_teams() -> list[str]:
    return prediction_service.get_available_teams()


@router.post("/predict", response_model=PredictionResponse)
def predict_match(request: PredictionRequest) -> PredictionResponse:
    try:
        print("===== ENTERED /predict =====", flush=True)
        prediction = prediction_service.predict_match(request.team_a, request.team_b)
        print("===== EXITING /predict =====", flush=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return PredictionResponse(
        team_a=prediction.team_a,
        team_b=prediction.team_b,
        winner=prediction.winner,
        win_probability=prediction.win_probability,
        draw_probability=prediction.draw_probability,
        loss_probability=prediction.loss_probability,
        team_a_expected_goals=prediction.team_a_expected_goals,
        team_b_expected_goals=prediction.team_b_expected_goals,
        most_likely_score=MostLikelyScoreResponse(
            team_a_goals=prediction.most_likely_score.team_a_goals,
            team_b_goals=prediction.most_likely_score.team_b_goals,
        ),
        most_likely_score_probability=prediction.most_likely_score.probability,
        team_a_recent_form=[
            RecentFormMatchResponse(
                opponent=match.opponent,
                result=match.result,
                score=match.score,
            )
            for match in prediction.team_a_recent_form
        ],
        team_b_recent_form=[
            RecentFormMatchResponse(
                opponent=match.opponent,
                result=match.result,
                score=match.score,
            )
            for match in prediction.team_b_recent_form
        ],
        head_to_head=[
            HeadToHeadMatchResponse(
                date=match.date,
                score=match.score,
                winner=match.winner,
            )
            for match in prediction.head_to_head
        ],
    )
