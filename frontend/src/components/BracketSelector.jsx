import { motion } from "framer-motion";
import { Play, ShieldCheck } from "lucide-react";
import { flagByTeam } from "../data/bracket.js";

function TeamSelect({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-textSecondary">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-textPrimary outline-none transition focus:border-worldCupGold focus:ring-4 focus:ring-worldCupGold/15"
      >
        {options.map((team) => (
          <option key={team} value={team}>
            {(flagByTeam[team] || "🏳️")} {team}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function BracketSelector({
  title,
  eyebrow,
  description,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftOptions,
  rightOptions,
  onLeftChange,
  onRightChange,
  onPredict,
  loading,
  disabled,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="glass-card rounded-3xl p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="fine-label">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-black text-textPrimary">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-textSecondary">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-textSecondary">
          <ShieldCheck className="h-4 w-4 text-worldCupGold" />
          Valid bracket only
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <TeamSelect label={leftLabel} value={leftValue} options={leftOptions} onChange={onLeftChange} />
        <TeamSelect label={rightLabel} value={rightValue} options={rightOptions} onChange={onRightChange} />
        <button
          type="button"
          onClick={onPredict}
          disabled={disabled || loading}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-worldCupGold px-5 py-3 text-sm font-black text-pitch transition hover:bg-[#E1B85B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {loading ? "Predicting…" : "Predict"}
        </button>
      </div>
    </motion.div>
  );
}
