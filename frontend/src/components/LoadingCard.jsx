import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";

const messages = [
  "Initializing prediction engine…",
  "Loading historical statistics…",
  "Calculating recent form…",
  "Computing head-to-head history…",
  "Estimating expected goals…",
  "Running prediction model…",
  "Predictions complete!",
];

export default function LoadingCard({ activeIndex }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="glass-card mx-auto max-w-xl p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-worldCupGold/15 text-worldCupGold">
          <Activity className="h-6 w-6 animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="fine-label">Prediction Engine</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-1 text-lg font-semibold text-textPrimary"
            >
              {messages[activeIndex] || messages.at(-1)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-worldCupGold"
          animate={{ width: `${((activeIndex + 1) / messages.length) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export { messages as loadingMessages };
