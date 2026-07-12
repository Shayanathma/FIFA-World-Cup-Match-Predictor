import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import BracketSelector from "../components/BracketSelector.jsx";
import ChampionCard from "../components/ChampionCard.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import LoadingCard, { loadingMessages } from "../components/LoadingCard.jsx";
import MatchCard from "../components/MatchCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { fixtureTeams, semiFinalFixtures } from "../data/bracket.js";
import { getTeams, predictMatch } from "../services/api.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="glass-card mx-auto max-w-2xl border-fifaRed/30 bg-fifaRed/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-red-100">Prediction request failed</p>
          <p className="mt-1 text-sm leading-6 text-red-100/80">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200/20 px-3 py-2 text-sm font-bold text-red-100"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      <p className="fine-label">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-textPrimary sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-textSecondary sm:text-base">{description}</p>
    </div>
  );
}

export default function Home() {
  const predictionRef = useRef(null);
  const semiSectionRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [semiPredictions, setSemiPredictions] = useState({});

  const [finalSelection, setFinalSelection] = useState({ left: "", right: "" });
  const [finalPrediction, setFinalPrediction] = useState(null);
  const [finalLoading, setFinalLoading] = useState(false);

  const finalOptions = {
    left: semiPredictions.sf1 ? fixtureTeams(semiFinalFixtures[0]) : [],
    right: semiPredictions.sf2 ? fixtureTeams(semiFinalFixtures[1]) : [],
  };

  const showSemiSection = Object.keys(semiPredictions).length > 0;
  const showFinalSection = Boolean(semiPredictions.sf1 && semiPredictions.sf2);
  const champion = finalPrediction?.winner && finalPrediction.winner !== "Draw"
    ? finalPrediction.winner
    : null;

  function bracketWinner(prediction, fallback) {
    return prediction.winner === prediction.team_a || prediction.winner === prediction.team_b
      ? prediction.winner
      : fallback;
  }

  async function runSemiFinals() {
    setStarted(true);
    setLoading(true);
    setError("");
    setSemiPredictions({});
    setFinalPrediction(null);
    setFinalSelection({ left: "", right: "" });

    requestAnimationFrame(() => {
      predictionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    try {
      const teamsPromise = getTeams();
      for (let index = 0; index < loadingMessages.length; index += 1) {
        setLoadingIndex(index);
        await sleep(index === loadingMessages.length - 1 ? 450 : 520);
      }

      const teams = await teamsPromise;
      setAvailableTeams(teams);
      const fixtureTeamsAreAvailable = semiFinalFixtures.every(
        (fixture) => teams.includes(fixture.teamA) && teams.includes(fixture.teamB),
      );
      if (!fixtureTeamsAreAvailable) {
        throw new Error("The backend team list does not include every semi-final fixture.");
      }

      setLoading(false);

      const nextSemiPredictions = {};
      for (let index = 0; index < semiFinalFixtures.length; index += 1) {
        const fixture = semiFinalFixtures[index];
        const prediction = await predictMatch(fixture.teamA, fixture.teamB);
        nextSemiPredictions[fixture.id] = prediction;
        setSemiPredictions((current) => ({ ...current, [fixture.id]: prediction }));
        if (index === 0) {
          window.requestAnimationFrame(() => {
            semiSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
        await sleep(320);
      }

      setFinalSelection({
        left: bracketWinner(nextSemiPredictions.sf1, semiFinalFixtures[0].teamA),
        right: bracketWinner(nextSemiPredictions.sf2, semiFinalFixtures[1].teamA),
      });
    } catch (requestError) {
      setLoading(false);
      setError(
        requestError?.response?.data?.detail ||
          requestError?.message ||
          "Unable to reach the prediction API.",
      );
    }
  }

  async function predictFinal(leftTeam = finalSelection.left, rightTeam = finalSelection.right) {
    if (!leftTeam || !rightTeam || leftTeam === rightTeam) return;
    setFinalLoading(true);
    setError("");
    try {
      const prediction = await predictMatch(leftTeam, rightTeam);
      setFinalPrediction(prediction);
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || requestError?.message || "Unable to predict final.");
    } finally {
      setFinalLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pitch text-textPrimary">
      <Navbar />
      <Hero onViewPredictions={runSemiFinals} />

      <main ref={predictionRef} className="bg-pitch py-14 sm:py-20">
        <div className="section-shell space-y-14">
          <AnimatePresence>
            {started && loading && <LoadingCard activeIndex={loadingIndex} />}
          </AnimatePresence>

          <ErrorBanner message={error} onRetry={!showSemiSection ? runSemiFinals : undefined} />

          {showSemiSection && (
            <section ref={semiSectionRef}>
              <SectionHeader
                eyebrow="Semi Finals"
                title="Predictions"
                description={`Two semi-final fixtures, revealed one by one from the backend model. ${availableTeams.length} selectable teams loaded from the API.`}
              />
              <div className="grid items-start gap-5 lg:grid-cols-2">
                {semiFinalFixtures.map((fixture, index) =>
                  semiPredictions[fixture.id] ? (
                    <MatchCard
                      key={fixture.id}
                      label={fixture.label}
                      prediction={semiPredictions[fixture.id]}
                      index={index}
                    />
                  ) : null,
                )}
              </div>
            </section>
          )}

          {showFinalSection && (
            <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionHeader
                eyebrow="Final"
                title="Predict the final"
                description="Choose one team from each semi-final path and run the last match prediction."
              />
              <BracketSelector
                eyebrow="World Cup Final"
                title={`${finalSelection.left || finalOptions.left[0]} vs ${finalSelection.right || finalOptions.right[0]}`}
                description="Only teams from completed semi-final paths are available."
                leftLabel="Winner of Semi-final 1"
                rightLabel="Winner of Semi-final 2"
                leftValue={finalSelection.left || finalOptions.left[0]}
                rightValue={finalSelection.right || finalOptions.right[0]}
                leftOptions={finalOptions.left}
                rightOptions={finalOptions.right}
                onLeftChange={(value) => {
                  setFinalSelection((current) => ({ ...current, left: value }));
                  setFinalPrediction(null);
                }}
                onRightChange={(value) => {
                  setFinalSelection((current) => ({ ...current, right: value }));
                  setFinalPrediction(null);
                }}
                onPredict={() => {
                  const left = finalSelection.left || finalOptions.left[0];
                  const right = finalSelection.right || finalOptions.right[0];
                  setFinalSelection({ left, right });
                  predictFinal(left, right);
                }}
                loading={finalLoading}
                disabled={!finalOptions.left.length || !finalOptions.right.length}
              />
              {finalPrediction && <MatchCard label="Final Prediction" prediction={finalPrediction} index={0} />}
            </motion.section>
          )}

          {champion && <ChampionCard champion={champion} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
