# ⚽️ FIFA World Cup 2026 Match Prediction System

A machine learning-based international football match predictor that uses Elo ratings, historical match results, XGBoost classification, and XGBoost score regression to estimate win/draw/loss probabilities and likely scorelines for FIFA World Cup-style fixtures.

> **Project Status:** In Progress  
> This project is actively being developed and improved. New features, additional data sources, model enhancements, and evaluation methods are being added as the project evolves.

## Features

- Elo rating system built from historical international matches
- Recent form and goal-difference features
- Head-to-head statistics
- Tournament and venue context features
- XGBoost multiclass classifier
- XGBoost score regressor for expected goals
- Poisson score matrix for most likely scoreline
- Chronological training pipeline to prevent future-data leakage
- FastAPI backend for match prediction
- Service layer ready for tournament simulation and evaluation workflows

## Data Source

This project uses the public international football results dataset maintained by:

https://github.com/martj42/international_results

The dataset contains international football match results dating back to 1872 and is supplemented with penalty shootout data for knockout-stage matches.

## Setup

Backend dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Frontend dependencies:

```bash
cd frotnend
npm install
```

## Backend Usage

### Run the API

```bash
uvicorn worldcup_predictor.api.main:app --reload
```

The API runs at `http://127.0.0.1:8000` by default.

### Endpoints

```bash
GET /teams
POST /predict
```

`GET /teams` returns the frontend-supported 2026 quarter-finalists:

```text
France
Morocco
Spain
Belgium
England
Norway
Argentina
Switzerland
```

`POST /predict` accepts:

```json
{
  "team_a": "France",
  "team_b": "Morocco"
}
```

Example:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"team_a": "France", "team_b": "Morocco"}'
```

Response shape:

```json
{
  "team_a": "France",
  "team_b": "Morocco",
  "winner": "France",
  "win_probability": 0.61,
  "draw_probability": 0.22,
  "loss_probability": 0.17,
  "team_a_expected_goals": 1.8,
  "team_b_expected_goals": 0.9,
  "most_likely_score": {
    "team_a_goals": 2,
    "team_b_goals": 1
  },
  "most_likely_score_probability": 0.11,
  "team_a_recent_form": [
    {
      "opponent": "Spain",
      "result": "W",
      "score": "2-1"
    }
  ],
  "team_b_recent_form": [
    {
      "opponent": "Belgium",
      "result": "D",
      "score": "1-1"
    }
  ],
  "head_to_head": [
    {
      "date": "2024-01-01",
      "score": "France 2-0 Morocco",
      "winner": "France"
    }
  ]
}
```

If no trained artifacts exist, the backend trains models on first prediction. Downloaded datasets are cached locally under `data_cache/`.

### Local Model Training

The public app is API-driven, but local model training can be run from your laptop:

```bash
worldcup-train-model
worldcup-train-model --force-download
```

Use `--force-download` when you want to refresh the GitHub CSV cache before creating new model artifacts.

## Frontend Usage

Create a local frontend environment file:

```bash
cd frontend
cp .env.example .env
```

Set the backend URL:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
BACKEND_CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

Run the React app:

```bash
cd frotnend
npm run dev
```

Build for production:

```bash
cd frotnend
npm run build
```

The frontend is designed for Vercel. Set `VITE_API_BASE_URL` in Vercel to the deployed Render backend URL.
Set `BACKEND_CORS_ORIGINS` in Render to the deployed Vercel frontend URL.

## Model

Version 2 uses:

- Historical international match results (`results.csv`)
- Penalty shootout winners (`shootouts.csv`) to adjust knockout draws into wins/losses
- Elo ratings
- Recent form statistics
- Goal-difference features
- Rest-day calculations
- Head-to-head history
- Venue context
- Tournament context
- `xgboost.XGBClassifier` for Team A Win / Draw / Team B Win prediction
- `xgboost.XGBRegressor` for team-perspective goals scored
- A Poisson probability distribution for score prediction

The classifier and regressor reuse the same feature engineering and chronological train/test split. During prediction, the same score regressor predicts Team A goals from `(Team A, Team B)` and Team B goals from `(Team B, Team A)`.

## Architecture

- `model.py`: training, model loading, team validation, and raw ML predictions
- `services/prediction.py`: business orchestration, allowed teams, winner derivation, and display-only match history
- `api/schemas.py`: Pydantic request and response models
- `api/routes.py`: HTTP endpoints that call the service layer
- `api/main.py`: FastAPI app factory

## Current Performance

Latest validation results:

- Validation Accuracy: **60.8%**
- Log Loss: **0.865**
- Score MAE: **0.954**

Evaluation is performed using a chronological train/test split to better reflect real-world forecasting scenarios.

## Disclaimer

Football is inherently unpredictable, and match outcomes can be influenced by factors that are not captured in historical data alone. Predictions generated by this project should be viewed as probabilistic estimates rather than guarantees.
