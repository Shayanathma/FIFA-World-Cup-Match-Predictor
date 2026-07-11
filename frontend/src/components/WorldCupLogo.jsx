import worldCupLogo from "../../images/fifa-world-cup-2026--white.9ba8a004.png";

export default function WorldCupLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3" aria-label="FIFA World Cup 2026">
      <img
        src={worldCupLogo}
        alt="FIFA World Cup 2026"
        className={`${compact ? "h-11 w-11" : "h-20 w-20 sm:h-24 sm:w-24"} shrink-0 rounded-2xl object-contain shadow-glow`}
      />
      {!compact && (
        <div className="hidden leading-tight sm:block">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-worldCupGold">FIFA</p>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
            World Cup 2026
          </p>
        </div>
      )}
    </div>
  );
}
