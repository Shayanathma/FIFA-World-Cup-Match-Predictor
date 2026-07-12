import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import WorldCupLogo from "./WorldCupLogo.jsx";

export default function Hero({ onViewPredictions }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_24%_18%,rgba(75,44,150,0.42),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(0,91,148,0.34),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(214,169,75,0.14),transparent_34%),linear-gradient(135deg,#070D1A_0%,#0B1220_48%,#061C35_100%)] pt-24">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:78px_78px] opacity-45" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-worldCupGold/10 to-transparent" />
      <div className="section-shell relative flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex w-full max-w-5xl flex-col items-center"
        >
          <WorldCupLogo />
          <h1 className="mt-8 max-w-6xl text-5xl font-black leading-[0.92] text-textPrimary sm:text-7xl lg:text-8xl">
            FIFA World Cup <span className="text-worldCupGold">2026</span>
            <span className="block">Match Predictor</span>
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-textSecondary sm:text-xl sm:leading-9">
            Machine-learning predictions for 2026 FIFA World Cup Semi-finals and Final matches with expected goals,
            recent form, head-to-head context, and a bracket that plays out one round at a time.
          </p>
          <button
            type="button"
            onClick={onViewPredictions}
            className="mt-16 inline-flex min-h-12 items-center gap-3 rounded-full bg-worldCupGold px-7 py-3 text-sm font-black text-pitch shadow-glow transition hover:scale-[1.02] hover:bg-[#E1B85B] focus:outline-none focus:ring-4 focus:ring-worldCupGold/30"
          >
            View Predictions
            <ChevronDown className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
