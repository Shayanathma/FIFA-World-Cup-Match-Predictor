import { probabilityFixed } from "../utils/prediction.js";

export default function StatBar({ label, value, tone = "gold" }) {
  const color = tone === "muted" ? "bg-slate-400" : "bg-worldCupGold";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-textSecondary">{label}</span>
        <span className="font-semibold text-textPrimary">{probabilityFixed(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(value * 100, 3)}%` }} />
      </div>
    </div>
  );
}
