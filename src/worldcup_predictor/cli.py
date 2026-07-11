from __future__ import annotations

import argparse

from worldcup_predictor.model import train


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="worldcup-train-model",
        description="Train local World Cup prediction model artifacts.",
    )
    parser.add_argument(
        "--force-download",
        action="store_true",
        help="Refresh cached CSV files before training.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    result = train(force_download=args.force_download)
    print(
        "Training complete. "
        f"Rows: {result.rows}. "
        f"Removed missing-score rows: {result.removed_missing_scores}. "
        f"Classifier accuracy: {result.accuracy:.3f}. "
        f"Classifier log loss: {result.log_loss:.3f}. "
        f"Score MAE: {result.score_mae:.3f}. "
        f"Score RMSE: {result.score_rmse:.3f}. "
        f"Score R2: {result.score_r2:.3f}."
    )
    return 0
