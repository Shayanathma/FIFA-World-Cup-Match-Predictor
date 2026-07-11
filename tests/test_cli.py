from worldcup_predictor.cli import build_parser


def test_train_cli_parses_force_download():
    args = build_parser().parse_args(["--force-download"])

    assert args.force_download is True
