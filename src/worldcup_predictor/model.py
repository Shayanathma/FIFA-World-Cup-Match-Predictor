from __future__ import annotations

from dataclasses import dataclass
from difflib import get_close_matches

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, log_loss, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import RandomizedSearchCV, TimeSeriesSplit

from .config import ARTIFACT_DIR, ID_TO_LABEL, METADATA_PATH, MODEL_PATH, SCORE_MODEL_PATH
from .data import load_dataset
from .features import FeatureState, build_prediction_features, build_training_frame_with_scores
from .poisson import most_likely_score


@dataclass
class TrainingResult:
    accuracy: float
    log_loss: float
    score_mae: float
    score_rmse: float
    score_r2: float
    rows: int
    removed_missing_scores: int


@dataclass
class PredictorBundle:
    model: object
    score_model: object
    feature_names: list[str]
    state: FeatureState
    teams: list[str]


def _make_model() -> object:
    try:
        from xgboost import XGBClassifier
    except Exception as exc:  # pragma: no cover - depends on local native libs.
        raise RuntimeError(
            "XGBoost could not be loaded. On macOS, install the OpenMP runtime "
            "with `brew install libomp`, then rerun training."
        ) from exc

    return XGBClassifier(
        objective="multi:softprob",
        num_class=3,
        n_estimators=250,
        max_depth=3,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="mlogloss",
        random_state=42,
    )


def _make_score_model() -> object:
    try:
        from xgboost import XGBRegressor
    except Exception as exc:  # pragma: no cover - depends on local native libs.
        raise RuntimeError(
            "XGBoost could not be loaded. On macOS, install the OpenMP runtime "
            "with `brew install libomp`, then rerun training."
        ) from exc

    return XGBRegressor(
        objective="reg:squarederror",
        n_estimators=250,
        max_depth=3,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="rmse",
        random_state=42,
    )


def train(force_download: bool = False) -> TrainingResult:
    matches = load_dataset(force_download)
    removed_missing_scores = int(matches.attrs.get("removed_missing_scores", 0))
    features, target, score_target, feature_names, state = build_training_frame_with_scores(matches)
    split = max(int(len(features) * 0.8), 1)
    x_train, x_test = features.iloc[:split], features.iloc[split:]
    y_train, y_test = target.iloc[:split], target.iloc[split:]
    y_score_train, y_score_test = score_target.iloc[:split], score_target.iloc[split:]

    model = _make_model()

    param_dist = {
        "n_estimators": [200, 300, 400, 500],
        "learning_rate": [0.01, 0.03, 0.05, 0.1],
        "max_depth": [3, 4, 5, 6],
        "min_child_weight": [1, 3, 5],
        "subsample": [0.7, 0.8, 0.9, 1.0],
        "colsample_bytree": [0.7, 0.8, 0.9, 1.0],
        "gamma": [0, 0.1, 0.3, 0.5],
    }

    tscv = TimeSeriesSplit(n_splits=5)

    print("\n========== Hyperparameter Tuning ==========")
    print(f"Training samples           : {len(x_train)}")
    print("TimeSeriesSplit folds      : 5")
    print("Random parameter sets      : 25")
    print("Total CV model fits        : 125")
    print("Scoring metric             : Negative Log Loss")
    print("===========================================\n")

    search = RandomizedSearchCV(
        estimator=model,
        param_distributions=param_dist,
        n_iter=25,
        scoring="neg_log_loss",
        cv=tscv,
        random_state=42,
        n_jobs=-1,
        verbose=3,
        return_train_score=True,
    )

    search.fit(x_train, y_train)

    print("\n========== Hyperparameter Tuning Complete ==========")
    print(f"Best CV Log Loss : {-search.best_score_:.4f}")
    print("Best Parameters:")
    for key, value in search.best_params_.items():
        print(f"  {key}: {value}")
    print("====================================================\n")

    model = search.best_estimator_

    score_model = _make_score_model()
    score_model.fit(x_train, y_score_train)

    importance = (
        pd.DataFrame(
            {
                "feature": feature_names,
                "importance": model.feature_importances_,
            }
        )
        .sort_values("importance", ascending=False)
    )

    print("\nTop 20 Features:")
    print(importance.head(20).to_string(index=False))

    if len(x_test) > 0:
        probabilities = model.predict_proba(x_test)
        predictions = np.argmax(probabilities, axis=1)
        accuracy = float(accuracy_score(y_test, predictions))
        loss = float(log_loss(y_test, probabilities, labels=[0, 1, 2]))
        score_predictions = np.clip(score_model.predict(x_test), 0.0, None)
        score_mae = float(mean_absolute_error(y_score_test, score_predictions))
        score_rmse = float(np.sqrt(mean_squared_error(y_score_test, score_predictions)))
        score_r2 = float(r2_score(y_score_test, score_predictions))
    else:
        accuracy = 0.0
        loss = 0.0
        score_mae = 0.0
        score_rmse = 0.0
        score_r2 = 0.0

    teams = sorted(set(matches["home_team"]).union(set(matches["away_team"])))
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(score_model, SCORE_MODEL_PATH)
    joblib.dump(
        {
            "feature_names": feature_names,
            "state": state,
            "teams": teams,
        },
        METADATA_PATH,
    )
    return TrainingResult(
        accuracy=accuracy,
        log_loss=loss,
        score_mae=score_mae,
        score_rmse=score_rmse,
        score_r2=score_r2,
        rows=len(features),
        removed_missing_scores=removed_missing_scores,
    )


def load_bundle() -> PredictorBundle:
    if not MODEL_PATH.exists() or not SCORE_MODEL_PATH.exists() or not METADATA_PATH.exists():
        train()
    model = joblib.load(MODEL_PATH)
    score_model = joblib.load(SCORE_MODEL_PATH)
    metadata = joblib.load(METADATA_PATH)
    return PredictorBundle(
        model=model,
        score_model=score_model,
        feature_names=metadata["feature_names"],
        state=metadata["state"],
        teams=metadata["teams"],
    )


def validate_team(team: str, teams: list[str]) -> str:
    if team in teams:
        return team
    lower_map = {known.lower(): known for known in teams}
    if team.lower() in lower_map:
        return lower_map[team.lower()]
    suggestions = get_close_matches(team, teams, n=5, cutoff=0.6)
    suffix = f" Did you mean: {', '.join(suggestions)}?" if suggestions else ""
    raise ValueError(f"Unknown team '{team}'.{suffix}")


def predict(team_a: str, team_b: str) -> dict[str, float]:
    bundle = load_bundle()
    resolved_a = validate_team(team_a, bundle.teams)
    resolved_b = validate_team(team_b, bundle.teams)
    if resolved_a == resolved_b:
        raise ValueError("Choose two different teams.")
    features = build_prediction_features(
        bundle.state,
        bundle.feature_names,
        resolved_a,
        resolved_b,
    )
    reverse_features = build_prediction_features(
        bundle.state,
        bundle.feature_names,
        resolved_b,
        resolved_a,
    )
    probabilities = bundle.model.predict_proba(features)[0]
    team_a_expected_goals = float(np.clip(bundle.score_model.predict(features)[0], 0.0, None))
    team_b_expected_goals = float(np.clip(bundle.score_model.predict(reverse_features)[0], 0.0, None))
    likely_a_goals, likely_b_goals, likely_score_probability = most_likely_score(
        team_a_expected_goals,
        team_b_expected_goals,
    )
    return {
        "team_a": resolved_a,
        "team_b": resolved_b,
        "loss": float(probabilities[0]),
        "draw": float(probabilities[1]),
        "win": float(probabilities[2]),
        "team_a_expected_goals": team_a_expected_goals,
        "team_b_expected_goals": team_b_expected_goals,
        "likely_team_a_goals": likely_a_goals,
        "likely_team_b_goals": likely_b_goals,
        "likely_score_probability": likely_score_probability,
    }
