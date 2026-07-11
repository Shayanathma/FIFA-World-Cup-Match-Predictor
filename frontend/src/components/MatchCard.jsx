import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { flagByTeam } from "../data/bracket.js";
import { scoreLabel } from "../utils/prediction.js";
import PredictionDetails from "./PredictionDetails.jsx";

function TeamLine({ team, align = "left" }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${align === "right" ? "justify-end" : ""}`}>
      <span className="text-2xl" aria-hidden="true">{flagByTeam[team] || "🏳️"}</span>
      <span className="truncate text-base font-bold text-textPrimary sm:text-lg">{team}</span>
    </div>
  );
}

export default function MatchCard({ prediction, label, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  if (!prediction) return null;
  const penaltiesExpected =
    prediction.most_likely_score.team_a_goals === prediction.most_likely_score.team_b_goals;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: "easeOut" }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="fine-label">{label}</p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamLine team={prediction.team_a} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-1.5 text-center">
            <p className="text-2xl font-black text-textPrimary">{scoreLabel(prediction)}</p>
            {penaltiesExpected && (
              <p className="mt-0.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-worldCupGold">
                Penalties expected
              </p>
            )}
          </div>
          <TeamLine team={prediction.team_b} align="right" />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-textPrimary transition hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-worldCupGold/20"
        >
          View Details
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <PredictionDetails prediction={prediction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
