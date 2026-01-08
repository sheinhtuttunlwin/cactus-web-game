import { useEffect, useState } from "react";
import net from "../network";
import Game from "./Game";

function Lobby() {
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [createPlayerName, setCreatePlayerName] = useState("Player");
  const [joinPlayerName, setJoinPlayerName] = useState("Player");
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState(null);
  const [lobbyState, setLobbyState] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Match progression state
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScores, setTotalScores] = useState({ 1: 0, 2: 0 });
  const [matchOver, setMatchOver] = useState(false);
  const [matchRounds, setMatchRounds] = useState(1);
  const [matchHistory, setMatchHistory] = useState([]);
  const [playerNames, setPlayerNames] = useState({ 1: 'Player 1', 2: 'Player 2' });

  useEffect(() => {
    net.connect();

    const handleCreated = ({ lobbyCode, lobbyState: initialState }) => {
      setCreatedCode(lobbyCode);
      setIsHost(true);
      setCreating(false);
      if (initialState) {
        setLobbyState(initialState);
      }
    };

    const handleJoined = ({ lobbyCode }) => {
      setCreatedCode(lobbyCode);
      setIsHost(false);
      setJoining(false);
    };

    const handleLobbyUpdate = (state) => {
      setLobbyState(state);
      if (state?.settings?.numberOfRounds) {
        setMatchRounds(state.settings.numberOfRounds);
      }
    };

    const handleLobbyStarted = () => {
      setGameStarted(true);
    };

    const handleLobbyFinished = () => {
      setMatchOver(true);
    };

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    net.on("lobby_created", handleCreated);
    net.on("lobby_joined", handleJoined);
    net.on("lobby_update", handleLobbyUpdate);
    net.on("lobby_started", handleLobbyStarted);
    // Listen for authoritative round updates from server so totals stay in sync
    const handleRoundUpdate = ({ match }) => {
      // eslint-disable-next-line no-console
      console.log('[NET] lobby round_update match', match);
      if (!match) return;
      if (match.totalScores) setTotalScores(match.totalScores);
      if (match.currentRound) setCurrentRound(match.currentRound);
      if (match.settings && match.settings.numberOfRounds) setMatchRounds(match.settings.numberOfRounds);
      if (match.history) setMatchHistory(match.history);
      if (match.playerNames) setPlayerNames(match.playerNames);
    };
    net.on('round_update', handleRoundUpdate);
    net.on("lobby_finished", handleLobbyFinished);
    net.on("connect", handleConnect);
    net.on("disconnect", handleDisconnect);

    return () => {
      net.off("lobby_created", handleCreated);
      net.off("lobby_joined", handleJoined);
      net.off("lobby_update", handleLobbyUpdate);
      net.off("lobby_started", handleLobbyStarted);
      net.off("lobby_finished", handleLobbyFinished);
      net.off('round_update', handleRoundUpdate);
      net.off("connect", handleConnect);
      net.off("disconnect", handleDisconnect);
    };
  }, []);

  const doCreate = () => {
    setCreating(true);
    const settings = { numberOfRounds: Number(rounds || 1), numberOfPlayers: 2 };
    net.createLobby({ settings, playerName: createPlayerName });
  };

  const doJoin = () => {
    setJoining(true);
    net.joinLobby({ lobbyCode: joinCode.trim(), playerName: joinPlayerName });
  };

  const doStart = () => {
    if (!createdCode) return;
    setMatchRounds(lobbyState?.settings?.numberOfRounds || 1);
    net._emit("start_lobby", { lobbyCode: createdCode });
  };

  const handleRoundComplete = (roundScores) => {
    // In online mode, the server is authoritative for round totals. Host triggers
    // server-side advance; clients will receive updated totals via 'round_update'.
    if (createdCode) {
      if (currentRound >= matchRounds) {
        setMatchOver(true);
        if (isHost) net._emit('finish_lobby', { lobbyCode: createdCode });
      } else {
        if (isHost) net._emit('reset_round', { roomId: createdCode });
      }
      return;
    }

    // Offline/local mode: apply scores locally
    setTotalScores((prev) => ({
      1: (prev[1] || 0) + (roundScores[1] || 0),
      2: (prev[2] || 0) + (roundScores[2] || 0),
    }));
    setMatchHistory((prev) => [...prev, roundScores]);
    if (currentRound >= matchRounds) {
      setMatchOver(true);
    } else {
      setCurrentRound((prev) => prev + 1);
    }
  };

  if (gameStarted && createdCode) {
    if (matchOver) {
      const winner = totalScores[1] < totalScores[2] ? 1 : totalScores[2] < totalScores[1] ? 2 : null;
      return (
        <div style={styles.page}>
          <h1>Match Over!</h1>
          <div style={styles.card}>
            <h2>Final Scores</h2>
            <p style={styles.scoreText}>Player 1: {totalScores[1]}</p>
            <p style={styles.scoreText}>Player 2: {totalScores[2]}</p>
            {winner && <p style={styles.winnerText}>Player {winner} Wins! 🎉</p>}
            {!winner && <p style={styles.tieText}>It's a Tie!</p>}
            <button onClick={() => (window.location.href = "/") } style={styles.button}>Return to Home</button>
          </div>
        </div>
      );
    }

    return (
      <Game
        key={currentRound}
        isOnlineFromLobby
        lobbyCode={createdCode}
        playerNameForLobby={isHost ? createPlayerName : joinPlayerName}
        numberOfPlayers={lobbyState?.settings?.numberOfPlayers || 2}
        currentRound={currentRound}
        totalRounds={matchRounds}
        totalScores={totalScores}
        onRoundComplete={handleRoundComplete}
        playerNames={playerNames}
        matchHistory={matchHistory}
      />
    );
  }

  if (createdCode) {
    return (
      <div style={styles.page}>
        <h1>Lobby {createdCode}</h1>
        {lobbyState && (
          <div style={styles.card}>
            <h3>Players ({lobbyState.players.length}/{lobbyState.maxPlayers || 2})</h3>
            <ul>
              {lobbyState.players.map((p, i) => (
                <li key={i}>{p.playerName}</li>
              ))}
            </ul>
            <p>Rounds: {lobbyState.settings?.numberOfRounds || 1}</p>
            {isHost && !lobbyState.isFull && <p>Waiting for players...</p>}
            {isHost && (
              <button onClick={doStart} style={styles.button} disabled={!lobbyState.isFull}>
                {lobbyState.isFull ? "Start Match" : "Waiting for players..."}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Lobby</h1>
      <div style={styles.card}>
        <h3>Create Lobby</h3>
        <label>
          Player name
          <input value={createPlayerName} onChange={(e) => setCreatePlayerName(e.target.value)} style={styles.input} />
        </label>
        <label>
          Rounds
          <input type="number" min={1} value={rounds} onChange={(e) => setRounds(e.target.value)} style={styles.input} />
        </label>
        <button onClick={doCreate} style={styles.button} disabled={!socketConnected || creating}>
          {!socketConnected ? "Connecting..." : creating ? "Creating..." : "Create Lobby"}
        </button>
      </div>

      <div style={styles.card}>
        <h3>Join Lobby</h3>
        <label>
          Player name
          <input value={joinPlayerName} onChange={(e) => setJoinPlayerName(e.target.value)} style={styles.input} />
        </label>
        <label>
          Lobby code
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} style={styles.input} />
        </label>
        <button onClick={doJoin} style={styles.button} disabled={!socketConnected || joining}>
          {!socketConnected ? "Connecting..." : joining ? "Joining..." : "Join Lobby"}
        </button>
      </div>
    </div>
  );
}

export default Lobby;

const styles = {
  page: { padding: 24, color: "white" },
  card: { background: "rgba(255,255,255,0.03)", padding: 18, marginBottom: 12, borderRadius: 8 },
  input: { display: "block", marginTop: 8, marginBottom: 12, padding: 8, borderRadius: 6, width: 240 },
  button: { padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginTop: 8 },
  scoreText: { fontSize: 18, marginBottom: 8 },
  winnerText: { fontSize: 20, fontWeight: "bold", color: "#22c55e", marginTop: 12 },
  tieText: { fontSize: 20, fontWeight: "bold", color: "#f59e0b", marginTop: 12 },
};
