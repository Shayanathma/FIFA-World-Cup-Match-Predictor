import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { flagByTeam } from "../data/bracket.js";

export default function ChampionCard({ champion }) {
  if (!champion) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="rounded-3xl border border-worldCupGold/30 bg-gradient-to-br from-worldCupGold/15 via-panel to-panel p-6 shadow-glow sm:p-8"
    >
      <div>
        <div>
          <p className="fine-label flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Projected Champion
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-5xl" aria-hidden="true">{flagByTeam[champion] || "🏆"}</span>
            <h2 className="text-4xl font-black text-textPrimary sm:text-5xl">{champion}</h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-textSecondary">
            Champion projection based on your bracket selections and the final match prediction.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
