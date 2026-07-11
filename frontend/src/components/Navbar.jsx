import WorldCupLogo from "./WorldCupLogo.jsx";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-pitch/70 backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center justify-between">
        <WorldCupLogo compact />
        <a
          href="https://github.com/Shayanathma/FIFA-World-Cup-Match-Predictor"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-textSecondary transition hover:border-worldCupGold/40 hover:text-worldCupGold"
        >
          View Project
        </a>
      </div>
    </header>
  );
}
