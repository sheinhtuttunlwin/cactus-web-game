import { useState } from "react";

/**
 * MatchSetup component - Initial screen for configuring a match
 * 
 * Allows players to configure:
 * - Number of rounds (3, 5, 7, or custom)
 * - Number of players (2-8, currently supports 2)
 */
function MatchSetup({ onStartMatch }) {
  const [numberOfRounds, setNumberOfRounds] = useState(3);
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [customRounds, setCustomRounds] = useState(false);

  const handleStartMatch = () => {
    if (numberOfRounds < 1 || numberOfRounds > 99) {
      alert("Please enter a valid number of rounds (1-99)");
      return;
    }
    
    onStartMatch({
      numberOfRounds,
      numberOfPlayers,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.setupCard}>
        <h1 style={styles.title}>🌵 Cactus Card Game</h1>
        <p style={styles.subtitle}>Match Setup</p>

        <div style={styles.section}>
          <label style={styles.label}>Number of Rounds</label>
          <div style={styles.buttonGroup}>
            {!customRounds ? (
              <>
                <button
                  style={{
                    ...styles.optionButton,
                    ...(numberOfRounds === 3 ? styles.optionButtonActive : {}),
                  }}
                  onClick={() => setNumberOfRounds(3)}
                >
                  3 Rounds
                </button>
                <button
                  style={{
                    ...styles.optionButton,
                    ...(numberOfRounds === 5 ? styles.optionButtonActive : {}),
                  }}
                  onClick={() => setNumberOfRounds(5)}
                >
                  5 Rounds
                </button>
                <button
                  style={{
                    ...styles.optionButton,
                    ...(numberOfRounds === 7 ? styles.optionButtonActive : {}),
                  }}
                  onClick={() => setNumberOfRounds(7)}
                >
                  7 Rounds
                </button>
                <button
                  style={styles.customButton}
                  onClick={() => setCustomRounds(true)}
                >
                  Custom
                </button>
              </>
            ) : (
              <div style={styles.customInputContainer}>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={numberOfRounds}
                  onChange={(e) => setNumberOfRounds(parseInt(e.target.value) || 1)}
                  style={styles.numberInput}
                  autoFocus
                />
                <button
                  style={styles.backButton}
                  onClick={() => {
                    setCustomRounds(false);
                    setNumberOfRounds(3);
                  }}
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Number of Players</label>
          <div style={styles.buttonGroup}>
            <button
              style={{
                ...styles.optionButton,
                ...(numberOfPlayers === 2 ? styles.optionButtonActive : {}),
              }}
              onClick={() => setNumberOfPlayers(2)}
            >
              2 Players
            </button>
            <button
              style={{
                ...styles.optionButton,
                opacity: 0.5,
                cursor: "not-allowed",
              }}
              disabled
              title="Coming soon: 3-8 player support"
            >
              3-8 Players (Soon)
            </button>
          </div>
        </div>

        <button style={styles.startButton} onClick={handleStartMatch}>
          Start Match
        </button>
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
  setupCard: {
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
  subtitle: {
    margin: 0,
    opacity: 0.85,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  section: {
    marginBottom: "32px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "8px",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  optionButton: {
    flex: "1",
    minWidth: "100px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.02)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    transition: "all 0.16s ease",
  },
  optionButtonActive: {
    backgroundColor: "rgba(34,197,94,0.95)",
    color: "#052e14",
    borderColor: "rgba(34,197,94,0.95)",
  },
  customButton: {
    flex: "1",
    minWidth: "100px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.02)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    transition: "all 0.16s ease",
  },
  customInputContainer: {
    display: "flex",
    gap: "8px",
    width: "100%",
  },
  numberInput: {
    flex: "1",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    outline: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.95)",
  },
  backButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.02)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
  },
  startButton: {
    width: "100%",
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
};

export default MatchSetup;
