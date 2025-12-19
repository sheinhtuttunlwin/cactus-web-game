import { useState } from "react";
import MatchSetup from "../components/MatchSetup";
import MatchOver from "../components/MatchOver";
import Game from "./Game";

/**
 * Match component - Orchestrates the entire match lifecycle
 * 
 * State Management:
 * - matchSettings: { numberOfRounds, numberOfPlayers }
 * - currentRound: tracks which round is being played (1-indexed)
 * - totalScores: accumulates scores across all rounds { 1: score, 2: score }
 * - matchPhase: "setup" | "playing" | "over"
 * 
 * Flow:
 * 1. Setup phase: User configures match settings
 * 2. Playing phase: Rounds are played sequentially
 *    - Game.jsx handles single round logic
 *    - Match.jsx tracks round completion via onRoundComplete callback
 *    - Round scores are added to totalScores
 *    - currentRound increments after each round
 * 3. Over phase: All rounds complete, show final results
 * 
 * Design Notes:
 * - Game.jsx remains unchanged - it handles single round gameplay
 * - Match.jsx wraps Game.jsx and provides match context via props
 * - Future-proof: numberOfPlayers can scale to 2-8
 * - Round scores flow up via callback, totals flow down via props
 */
function Match() {
  const [matchPhase, setMatchPhase] = useState("setup"); // "setup" | "playing" | "over"
  const [matchSettings, setMatchSettings] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScores, setTotalScores] = useState({});

  const handleStartMatch = (settings) => {
    setMatchSettings(settings);
    setMatchPhase("playing");
    setCurrentRound(1);
    
    // Initialize total scores for all players
    const initialScores = {};
    for (let i = 1; i <= settings.numberOfPlayers; i++) {
      initialScores[i] = 0;
    }
    setTotalScores(initialScores);
  };

  const handleRoundComplete = (roundScores) => {
    // roundScores is an object like { 1: 15, 2: 23 }
    // Add these to the running totals
    setTotalScores((prevTotals) => {
      const newTotals = { ...prevTotals };
      Object.keys(roundScores).forEach((playerId) => {
        newTotals[playerId] = (newTotals[playerId] || 0) + roundScores[playerId];
      });
      return newTotals;
    });

    // Check if this was the final round
    if (currentRound >= matchSettings.numberOfRounds) {
      setMatchPhase("over");
    } else {
      // Move to next round
      setCurrentRound((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setMatchPhase("setup");
    setMatchSettings(null);
    setCurrentRound(1);
    setTotalScores({});
  };

  if (matchPhase === "setup") {
    return <MatchSetup onStartMatch={handleStartMatch} />;
  }

  if (matchPhase === "over") {
    return (
      <MatchOver
        totalScores={totalScores}
        numberOfPlayers={matchSettings.numberOfPlayers}
        onRestart={handleRestart}
      />
    );
  }

  // matchPhase === "playing"
  return (
    <Game
      key={currentRound} // Force remount on round change for fresh state
      numberOfPlayers={matchSettings.numberOfPlayers}
      currentRound={currentRound}
      totalRounds={matchSettings.numberOfRounds}
      totalScores={totalScores}
      onRoundComplete={handleRoundComplete}
      onExitToSetup={handleRestart}
    />
  );
}

export default Match;
