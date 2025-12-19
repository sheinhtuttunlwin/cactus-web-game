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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2d5016 0%, #1a3d0a 100%)",
    padding: "20px",
  },
  setupCard: {
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
    margin: "0 0 8px 0",
    textAlign: "center",
    color: "#2d5016",
  },
  subtitle: {
    fontSize: "18px",
    color: "#666",
    textAlign: "center",
    margin: "0 0 32px 0",
  },
  section: {
    marginBottom: "32px",
  },
  label: {
    display: "block",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "12px",
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
    fontWeight: "500",
    border: "2px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  optionButtonActive: {
    backgroundColor: "#2d5016",
    color: "#fff",
    borderColor: "#2d5016",
  },
  customButton: {
    flex: "1",
    minWidth: "100px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    border: "2px solid #2d5016",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#2d5016",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    border: "2px solid #2d5016",
    borderRadius: "8px",
    outline: "none",
  },
  backButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    border: "2px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
  },
  startButton: {
    width: "100%",
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
};

export default MatchSetup;
