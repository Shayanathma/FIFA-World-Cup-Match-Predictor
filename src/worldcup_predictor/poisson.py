from __future__ import annotations

from math import exp, factorial

import numpy as np


def poisson_probability(goals: int, expected_goals: float) -> float:
    lam = max(float(expected_goals), 0.001)
    return float((lam**goals) * exp(-lam) / factorial(goals))


def score_probability_matrix(
    team_a_expected_goals: float,
    team_b_expected_goals: float,
    max_goals: int = 10,
) -> np.ndarray:
    team_a_probs = np.array(
        [poisson_probability(goals, team_a_expected_goals) for goals in range(max_goals + 1)]
    )
    team_b_probs = np.array(
        [poisson_probability(goals, team_b_expected_goals) for goals in range(max_goals + 1)]
    )
    return np.outer(team_a_probs, team_b_probs)


def most_likely_score(
    team_a_expected_goals: float,
    team_b_expected_goals: float,
    max_goals: int = 10,
) -> tuple[int, int, float]:
    matrix = score_probability_matrix(
        team_a_expected_goals,
        team_b_expected_goals,
        max_goals=max_goals,
    )

    # Probability of the most likely Poisson scoreline
    mode_a, mode_b = np.unravel_index(np.argmax(matrix), matrix.shape)
    probability = float(matrix[mode_a, mode_b])

    # Display the most likely scoreline from the joint Poisson probability matrix
    return int(mode_a), int(mode_b), probability
