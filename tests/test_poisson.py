from worldcup_predictor.poisson import most_likely_score, score_probability_matrix


def test_score_probability_matrix_shape():
    matrix = score_probability_matrix(1.5, 1.0, max_goals=4)

    assert matrix.shape == (5, 5)
    assert matrix[0, 0] > 0


def test_most_likely_score_returns_goals_and_probability():
    team_a_goals, team_b_goals, probability = most_likely_score(1.2, 0.7, max_goals=5)

    assert isinstance(team_a_goals, int)
    assert isinstance(team_b_goals, int)
    assert 0 < probability < 1
