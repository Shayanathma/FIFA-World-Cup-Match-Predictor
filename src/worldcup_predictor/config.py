from __future__ import annotations

from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_DIR.parents[1]

DATA_CACHE_DIR = PROJECT_ROOT / "data_cache"
ARTIFACT_DIR = PACKAGE_DIR / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "xgb_model.joblib"
SCORE_MODEL_PATH = ARTIFACT_DIR / "xgb_score_model.joblib"
METADATA_PATH = ARTIFACT_DIR / "metadata.joblib"

RESULTS_URL = (
    "https://raw.githubusercontent.com/martj42/international_results/master/results.csv"
)
SHOOTOUTS_URL = (
    "https://raw.githubusercontent.com/martj42/international_results/master/shootouts.csv"
)

DEFAULT_ELO = 1500.0
ELO_K = 20.0
RECENT_WINDOWS = (5, 10)
LABELS = ("loss", "draw", "win")
LABEL_TO_ID = {label: idx for idx, label in enumerate(LABELS)}
ID_TO_LABEL = {idx: label for label, idx in LABEL_TO_ID.items()}
