import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import BracketSelector from "../components/BracketSelector.jsx";
import ChampionCard from "../components/ChampionCard.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import LoadingCard, { loadingMessages } from "../components/LoadingCard.jsx";
import MatchCard from "../components/MatchCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { fixtureTeams, quarterFinalFixtures, semiFinalSlots } from "../data/bracket.js";
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
  const quarterSectionRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [quarterPredictions, setQuarterPredictions] = useState([]);

  const [semiSelections, setSemiSelections] = useState({
    sf1: { left: "France", right: "Belgium" },
    sf2: { left: "England", right: "Argentina" },
  });
  const [semiPredictions, setSemiPredictions] = useState({});
  const [semiLoading, setSemiLoading] = useState({});

  const [finalSelection, setFinalSelection] = useState({ left: "", right: "" });
  const [finalPrediction, setFinalPrediction] = useState(null);
  const [finalLoading, setFinalLoading] = useState(false);

  const quarterById = useMemo(() => {
    return Object.fromEntries(quarterFinalFixtures.map((fixture) => [fixture.id, fixture]));
  }, []);

  const semiOptions = useMemo(() => {
    return Object.fromEntries(
      semiFinalSlots.map((slot) => [
        slot.id,
        {
          left: fixtureTeams(quarterById[slot.sources[0]]),
          right: fixtureTeams(quarterById[slot.sources[1]]),
        },
      ]),
    );
  }, [quarterById]);

  const finalOptions = useMemo(() => {
    const sf1 = semiPredictions.sf1
      ? [semiSelections.sf1.left, semiSelections.sf1.right]
      : [];
    const sf2 = semiPredictions.sf2
      ? [semiSelections.sf2.left, semiSelections.sf2.right]
      : [];
    return { left: sf1, right: sf2 };
  }, [semiPredictions, semiSelections]);

  const showSemiSection = quarterPredictions.length === quarterFinalFixtures.length;
  const showFinalSection = Boolean(semiPredictions.sf1 && semiPredictions.sf2);
  const champion = finalPrediction?.winner && finalPrediction.winner !== "Draw"
    ? finalPrediction.winner
    : null;

  async function runQuarterFinals() {
    setStarted(true);
    setLoading(true);
    setError("");
    setQuarterPredictions([]);
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
      const fixtureTeamsAreAvailable = quarterFinalFixtures.every(
        (fixture) => teams.includes(fixture.teamA) && teams.includes(fixture.teamB),
      );
      if (!fixtureTeamsAreAvailable) {
        throw new Error("The backend team list does not include every quarter-final fixture.");
      }

      setLoading(false);

      for (let index = 0; index < quarterFinalFixtures.length; index += 1) {
        const fixture = quarterFinalFixtures[index];
        const prediction = await predictMatch(fixture.teamA, fixture.teamB);
        setQuarterPredictions((current) => [...current, { fixture, prediction }]);
        if (index === 0) {
          window.requestAnimationFrame(() => {
            quarterSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
        await sleep(320);
      }
    } catch (requestError) {
      setLoading(false);
      setError(
        requestError?.response?.data?.detail ||
          requestError?.message ||
          "Unable to reach the prediction API.",
      );
    }
  }

  function updateSemiSelection(slotId, side, value) {
    setSemiSelections((current) => ({
      ...current,
      [slotId]: {
        ...current[slotId],
        [side]: value,
      },
    }));
    setSemiPredictions((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    setFinalPrediction(null);
  }

  function bracketWinner(prediction, fallback) {
    return prediction.winner === prediction.team_a || prediction.winner === prediction.team_b
      ? prediction.winner
      : fallback;
  }

  async function predictSemi(slotId) {
    const selection = semiSelections[slotId];
    if (!selection.left || !selection.right || selection.left === selection.right) return;
    setSemiLoading((current) => ({ ...current, [slotId]: true }));
    setError("");
    try {
      const prediction = await predictMatch(selection.left, selection.right);
      const advancingTeam = bracketWinner(prediction, selection.left);
      setSemiPredictions((current) => ({ ...current, [slotId]: prediction }));
      setFinalPrediction(null);
      setFinalSelection((current) => ({
        left: slotId === "sf1" ? advancingTeam : current.left,
        right: slotId === "sf2" ? advancingTeam : current.right,
      }));
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || requestError?.message || "Unable to predict semi-final.");
    } finally {
      setSemiLoading((current) => ({ ...current, [slotId]: false }));
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
      <Hero onViewPredictions={runQuarterFinals} />

      <main ref={predictionRef} className="bg-pitch py-14 sm:py-20">
        <div className="section-shell space-y-14">
          <AnimatePresence>
            {started && loading && <LoadingCard activeIndex={loadingIndex} />}
          </AnimatePresence>

          <ErrorBanner message={error} onRetry={quarterPredictions.length === 0 ? runQuarterFinals : undefined} />

          {quarterPredictions.length > 0 && (
            <section ref={quarterSectionRef}>
              <SectionHeader
                eyebrow="Quarter Finals"
                title="Predictions"
                description={`Four official quarter-final fixtures, revealed one by one from the backend model. ${availableTeams.length} selectable teams loaded from the API.`}
              />
              <div className="grid items-start gap-5 lg:grid-cols-2">
                {quarterPredictions.map(({ fixture, prediction }, index) => (
                  <MatchCard
                    key={fixture.id}
                    label={fixture.label}
                    prediction={prediction}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          {showSemiSection && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <SectionHeader
                eyebrow="Semi Finals"
                title="Build the next round"
                description="Select one valid winner from each quarter-final path, then run the backend model for each semi-final."
              />
              <div className="space-y-6">
                {semiFinalSlots.map((slot) => (
                  <div key={slot.id} className="space-y-5">
                    <BracketSelector
                      eyebrow={slot.label}
                      title={`${semiSelections[slot.id].left} vs ${semiSelections[slot.id].right}`}
                      description="Choose the two teams advancing from the linked quarter-finals."
                      leftLabel={`${quarterById[slot.sources[0]].teamA} vs ${quarterById[slot.sources[0]].teamB}`}
                      rightLabel={`${quarterById[slot.sources[1]].teamA} vs ${quarterById[slot.sources[1]].teamB}`}
                      leftValue={semiSelections[slot.id].left}
                      rightValue={semiSelections[slot.id].right}
                      leftOptions={semiOptions[slot.id].left}
                      rightOptions={semiOptions[slot.id].right}
                      onLeftChange={(value) => updateSemiSelection(slot.id, "left", value)}
                      onRightChange={(value) => updateSemiSelection(slot.id, "right", value)}
                      onPredict={() => predictSemi(slot.id)}
                      loading={semiLoading[slot.id]}
                      disabled={semiSelections[slot.id].left === semiSelections[slot.id].right}
                    />
                    {semiPredictions[slot.id] && (
                      <MatchCard
                        label={slot.label}
                        prediction={semiPredictions[slot.id]}
                        index={0}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {showFinalSection && (
            <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionHeader
                eyebrow="Final"
                title="Predict the final"
                description="Choose the two semi-final winners and run the last match prediction."
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
