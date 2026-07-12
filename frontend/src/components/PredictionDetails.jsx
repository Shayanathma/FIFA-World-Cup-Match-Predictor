import { History } from "lucide-react";

function resultTone(result) {
  if (result === "W") return "bg-emerald-500/20 text-emerald-300";
  if (result === "L") return "bg-rose-500/20 text-rose-300";
  return "bg-slate-400/20 text-slate-300";
}

function ProbabilityStrip({ label, value, highlight = false }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-sm">
        <span
          title={label}
          className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-textSecondary sm:text-xs"
        >
          {label}
        </span>
        <span className={`shrink-0 text-base font-black sm:text-lg ${highlight ? "text-worldCupGold" : "text-textPrimary"}`}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${highlight ? "bg-worldCupGold" : "bg-slate-400"}`}
          style={{ width: `${Math.max(value * 100, 4)}%` }}
        />
      </div>
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="flex min-h-[72px] min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.035] p-2.5 sm:min-h-[96px] sm:rounded-2xl sm:p-4">
      <p
        title={label}
        className="min-w-0 truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-textSecondary sm:text-xs sm:tracking-[0.14em]"
      >
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-textPrimary sm:mt-3 sm:text-2xl">{value}</p>
    </div>
  );
}

function FormDots({ title, items }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary sm:mb-3 sm:text-xs">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {items?.length ? (
          items.map((match, index) => (
            <span
              key={`${match.opponent}-${match.score}-${index}`}
              title={`${match.opponent} ${match.score}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black sm:h-9 sm:w-9 sm:text-sm ${resultTone(match.result)}`}
            >
              {match.result}
            </span>
          ))
        ) : (
          <p className="text-sm text-textSecondary">No recent matches.</p>
        )}
      </div>
    </div>
  );
}

function HeadToHeadTable({ items }) {
  function splitScore(score) {
    const match = score.match(/^(.*?)\s+(\d+-\d+)\s+(.*?)$/);
    if (!match) return { left: "", score, right: "" };
    return { left: match[1], score: match[2], right: match[3] };
  }

  function winnerClass(team, winner) {
    return team === winner ? "font-black text-worldCupGold" : "text-textPrimary";
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary sm:mb-3 sm:text-xs">
        <History className="h-3.5 w-3.5 text-worldCupGold sm:h-4 sm:w-4" />
        Head-to-head · Last 5
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
        {items?.length ? (
          items.map((match, index) => {
            const scoreParts = splitScore(match.score);
            return (
              <div
                key={`${match.date}-${index}`}
                className="grid grid-cols-[4.4rem_1fr] items-center gap-2 border-b border-white/10 px-3 py-2.5 text-xs last:border-b-0 sm:grid-cols-[5rem_1fr] sm:gap-3 sm:px-4 sm:py-3 sm:text-sm"
              >
                <span className="text-textSecondary">{match.date}</span>
                <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                  <span
                    title={scoreParts.left}
                    className={`truncate text-right ${winnerClass(scoreParts.left, match.winner)}`}
                  >
                    {scoreParts.left}
                  </span>
                  <span className="rounded-full border border-white/10 bg-pitch px-2.5 py-1 font-black text-textPrimary">
                    {scoreParts.score}
                  </span>
                  <span
                    title={scoreParts.right}
                    className={`truncate text-left ${winnerClass(scoreParts.right, match.winner)}`}
                  >
                    {scoreParts.right}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-4 text-sm text-textSecondary">No recent meetings available.</p>
        )}
      </div>
    </div>
  );
}

export default function PredictionDetails({ prediction }) {
  const winnerIsTeamA = prediction.winner === prediction.team_a;
  const winnerIsTeamB = prediction.winner === prediction.team_b;

  return (
    <div className="space-y-5 pt-5 sm:space-y-8 sm:pt-6">
      <div className="grid grid-cols-3 items-start gap-3 md:gap-4">
        <ProbabilityStrip
          label={`${prediction.team_a} win`}
          value={prediction.win_probability}
          highlight={winnerIsTeamA}
        />
        <ProbabilityStrip
          label="Draw"
          value={prediction.draw_probability}
          highlight={prediction.winner === "Draw"}
        />
        <ProbabilityStrip
          label={`${prediction.team_b} win`}
          value={prediction.loss_probability}
          highlight={winnerIsTeamB}
        />
      </div>

      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricTile label={`xG · ${prediction.team_a}`} value={prediction.team_a_expected_goals.toFixed(2)} />
        <MetricTile label={`xG · ${prediction.team_b}`} value={prediction.team_b_expected_goals.toFixed(2)} />
        <MetricTile
          label="Most likely"
          value={`${prediction.most_likely_score.team_a_goals}-${prediction.most_likely_score.team_b_goals}`}
        />
        <MetricTile
          label="Score probability"
          value={`${(prediction.most_likely_score_probability * 100).toFixed(0)}%`}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <FormDots title={`Last 10 · ${prediction.team_a}`} items={prediction.team_a_recent_form} />
        <FormDots title={`Last 10 · ${prediction.team_b}`} items={prediction.team_b_recent_form} />
      </div>

      <HeadToHeadTable items={prediction.head_to_head} />
    </div>
  );
}
