/**
 * MatchOver component - Displays final match results
 * 
 * Shows:
 * - Total scores for all players across all rounds
 * - Winner announcement
 * - Option to restart (return to setup)
 */
function MatchOver({ totalScores, numberOfPlayers, onRestart }) {
  // Find winner (lowest score wins in Cactus)
  const playerScores = Array.from({ length: numberOfPlayers }, (_, i) => ({
    player: i + 1,
    score: totalScores[i + 1] || 0,
  }));

  // Sort by score (ascending - lowest score wins)
  const sortedScores = [...playerScores].sort((a, b) => a.score - b.score);
  const winner = sortedScores[0];
  const isTie = sortedScores.filter((p) => p.score === winner.score).length > 1;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏆 Match Over!</h1>
        
        {isTie ? (
          <p style={styles.winnerText}>It's a tie!</p>
        ) : (
          <p style={styles.winnerText}>
            Player {winner.player} wins with {winner.score} points!
          </p>
        )}

        <div style={styles.scoresSection}>
          <h2 style={styles.scoresTitle}>Final Scores</h2>
          <div style={styles.scoresList}>
            {sortedScores.map((player, index) => (
              <div
                key={player.player}
                style={{
                  ...styles.scoreRow,
                  ...(index === 0 ? styles.scoreRowWinner : {}),
                }}
              >
                <span style={styles.playerName}>
                  {index === 0 && !isTie && "👑 "}
                  Player {player.player}
                </span>
                <span style={styles.playerScore}>{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.restartButton} onClick={onRestart}>
            New Match
          </button>
        </div>

        <p style={styles.footnote}>
          Lower score wins in Cactus!
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background:
      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 35%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.06), transparent 40%), #0b1220",
  },
  card: {
    width: "min(700px, 95vw)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "radial-gradient(circle at 50% 40%, rgba(34,197,94,0.12), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    letterSpacing: 0.2,
    color: "#fff",
    textAlign: "center",
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 600,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    margin: "0 0 16px 0",
  },
  scoresSection: {
    marginBottom: "16px",
  },
  scoresTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    marginBottom: "12px",
    textAlign: "center",
  },
  scoresList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.02)",
  },
  scoreRowWinner: {
    backgroundColor: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  playerName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  playerScore: {
    fontSize: "16px",
    fontWeight: "700",
    color: "rgba(34,197,94,0.95)",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  restartButton: {
    flex: "1",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "rgba(34,197,94,0.95)",
    color: "#052e14",
    cursor: "pointer",
    transition: "all 0.16s ease",
    boxShadow: "0 8px 24px rgba(34,197,94,0.12)",
  },
  footnote: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.66)",
    textAlign: "center",
    marginTop: "16px",
    marginBottom: "0",
  },
};

export default MatchOver;
