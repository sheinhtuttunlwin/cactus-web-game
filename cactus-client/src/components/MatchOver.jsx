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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2d5016 0%, #1a3d0a 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    margin: "0 0 16px 0",
    textAlign: "center",
    color: "#2d5016",
  },
  winnerText: {
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
    margin: "0 0 32px 0",
  },
  scoresSection: {
    marginBottom: "32px",
  },
  scoresTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "16px",
    textAlign: "center",
  },
  scoresList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    border: "2px solid transparent",
  },
  scoreRowWinner: {
    backgroundColor: "#e8f5e9",
    border: "2px solid #2d5016",
  },
  playerName: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#333",
  },
  playerScore: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2d5016",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  restartButton: {
    flex: "1",
    padding: "16px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2d5016",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(45, 80, 22, 0.3)",
  },
  footnote: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginTop: "24px",
    marginBottom: "0",
  },
};

export default MatchOver;
