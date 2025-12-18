import * as actions from "../game/actions";
import { SELF_PEEK, OPPONENT_PEEK } from "../game/powers";
import { useState, useEffect } from "react";

const LookButton = ({ expiresAt, onClick }) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!expiresAt) return setProgress(0);
    let timerId = null;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setProgress(remaining / 10000); // fraction 0..1
      if (remaining > 0) {
        timerId = setTimeout(tick, 100); // update every 100ms instead of every frame
      }
    };
    tick();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [expiresAt]);

  if (!expiresAt || progress <= 0) return null;

  const container = {
    width: 70,
    height: 22,
    padding: 2,
    borderRadius: 6,
    background: "linear-gradient(180deg,#2b2b2b,#1e1e1e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 12,
    position: "relative",
    overflow: "hidden",
  };
  const bar = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress * 100}%`,
    background: "rgba(34,197,94,0.5)",
    transition: "width 100ms linear",
  };
  const label = { zIndex: 2, fontWeight: 700 };

  return (
    <div style={container} onClick={onClick} title="Use Look power">
      <div style={bar} />
      <div style={label}>Look</div>
    </div>
  );
};

const RevealProgressBar = ({ expiresAt, onClick }) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!expiresAt) return setProgress(0);
    let timerId = null;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setProgress(remaining / 4000); // 4s reveal duration
      if (remaining > 0) {
        timerId = setTimeout(tick, 100);
      }
    };
    tick();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [expiresAt]);

  if (!expiresAt || progress <= 0) return null;

  const container = {
    width: 70,
    height: 22,
    padding: 2,
    borderRadius: 6,
    background: "linear-gradient(180deg,#2b2b2b,#1e1e1e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 12,
    position: "relative",
    overflow: "hidden",
  };
  const bar = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress * 100}%`,
    background: "rgba(100,200,255,0.5)",
    transition: "width 100ms linear",
  };
  const label = { zIndex: 2, fontWeight: 700 };

  return (
    <div style={container} onClick={onClick} title="Close card reveal">
      <div style={bar} />
      <div style={label}>Close</div>
    </div>
  );
};

const PowerButton = ({ power, activePower, activePowerToken, activePowerExpiresAt, cardRevealExpiresAt, revealedCardId, cardId, onClick, onClose, showClose = true, buttonLabel = "Look" }) => {
  if (activePower === power && activePowerToken) {
    return (
      <LookButton
        expiresAt={activePowerExpiresAt}
        onClick={onClick}
      />
    );
  }
  if (showClose && cardRevealExpiresAt && revealedCardId === cardId) {
    return <RevealProgressBar expiresAt={cardRevealExpiresAt} onClick={onClose} />;
  }
  return null;
};

function Game () {

    const [deck, setDeck] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [hasStackedThisRound, setHasStackedThisRound] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
    const [players, setPlayers] = useState({
      1: { hand: [], pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, revealedCardId: null, cardRevealExpiresAt: null },
      2: { hand: [], pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, revealedCardId: null, cardRevealExpiresAt: null },
    });

    // Deal 4 cards to each player at game start and put one card in discard pile
    useEffect(() => {
      actions.dealInitial({ setDeck, setDiscardPile, setPlayers, setCurrentPlayer, setHasStackedThisRound });
    }, []);

    // If a card is drawn, cancel discard-swap mode to avoid invalid state combinations
    useEffect(() => {
      if (players[currentPlayer].pendingCard) {
        setPlayers((prev) => ({
          ...prev,
          [currentPlayer]: { ...prev[currentPlayer], swappingWithDiscard: false },
        }));
      }
    }, [players[currentPlayer].pendingCard, currentPlayer]);

    const handleDraw = () => {
      actions.handleDraw({ deck, setDeck, players, setPlayers, currentPlayer });
    };

    const handleDiscardPending = () => {
      actions.handleDiscardPending({ players, setPlayers, currentPlayer, setDiscardPile, setHasStackedThisRound, setCurrentPlayer });
    };

    const handleSwapWith = (index) => {
      actions.handleSwapWith({ players, setPlayers, currentPlayer, index, setDiscardPile, setHasStackedThisRound, setCurrentPlayer });
    };


    const handleStack = (playerNum, index) => {
      if (hasStackedThisRound) {
        alert("This card has already been stacked on. Discard or swap to add a new card.");
        return;
      }

      const result = actions.handleStack({ discardPile, players, setPlayers, playerNum, index, deck, setDeck, setHasStackedThisRound });
      if (result && result.success) {
        actions.finalizeStack({ setDiscardPile, handCard: result.card, setHasStackedThisRound });
      }
    };

    const handleSwapWithDiscard = (index) => {
      actions.handleSwapWithDiscard({ discardPile, players, setPlayers, currentPlayer, index, setDiscardPile, setHasStackedThisRound, setCurrentPlayer });
    };

    const handleResetDeck = () => {
      actions.handleResetDeck({ setDeck, setPlayers, setDiscardPile, setCurrentPlayer, setHasStackedThisRound });
    };

    const actionButtonStyle = (baseStyle, disabled) => ({
      ...baseStyle,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    });

    return (
        <div style={styles.page}>
            <div style={styles.table}>
            <header style={styles.header}>
                <h1 style={styles.title}>Card Test</h1>
                <p style={styles.subtitle}>2-Player Turn-Based Game</p>
                <p style={styles.turnIndicator}>Player {currentPlayer}'s Turn</p>
            </header>

            <div style={styles.centerArea}>
                {/* Deck pile */}
                <div style={styles.pile}>
                <div style={styles.cardBack} />
                <div style={styles.pileLabel}>
                    <div style={styles.pileName}>Deck</div>
                    <div style={styles.pileCount}>{deck.length} cards</div>
                </div>
                </div>

                {/* Current card */}
                <div style={styles.currentSlot}>
                <div style={styles.currentLabel}>Current Card</div>

                <div style={styles.cardFace}>
                  {players[currentPlayer].pendingCard ? (
                  <div
                    style={{
                    ...styles.cardText,
                    color: players[currentPlayer].pendingCard.color === "red" ? "crimson" : "white",
                    }}
                  >
                    {players[currentPlayer].pendingCard.rank}
                    {players[currentPlayer].pendingCard.suit}
                  </div>
                  ) : (
                  <div style={styles.cardPlaceholder}>Draw to reveal</div>
                  )}
                </div>

                <div style={styles.controls}>
                    <button
                      style={actionButtonStyle(styles.button, deck.length === 0 || !!players[currentPlayer].pendingCard || players[currentPlayer].swappingWithDiscard)}
                      onClick={handleDraw}
                      disabled={deck.length === 0 || !!players[currentPlayer].pendingCard || players[currentPlayer].swappingWithDiscard}
                      title={
                        players[currentPlayer].swappingWithDiscard
                          ? "Cancel swap with discard first"
                          : deck.length === 0
                          ? "Deck is empty"
                          : players[currentPlayer].pendingCard
                          ? "Resolve drawn card first"
                          : "Draw a card"
                      }
                    >
                      Draw
                    </button>

                    <button style={styles.buttonSecondary} onClick={handleResetDeck}>
                    Reset
                    </button>

                    {players[currentPlayer].pendingCard ? (
                      <button style={styles.button} onClick={handleDiscardPending} title="Discard drawn card">
                        Discard
                      </button>
                    ) : null}
                </div>
                </div>

                {/* Discard pile */}
                <div style={styles.pile}>
                <div style={styles.discardTop}>
                    {discardPile.length > 0 ? (
                    <div
                        style={{
                        ...styles.discardMiniText,
                        color:
                            discardPile[discardPile.length - 1].color === "red"
                            ? "crimson"
                            : "white",
                        }}
                    >
                        {discardPile[discardPile.length - 1].rank}
                        {discardPile[discardPile.length - 1].suit}
                    </div>
                    ) : (
                    <div style={styles.discardMiniPlaceholder}>Empty</div>
                    )}
                </div>

                {discardPile.length > 0 ? (
                  <button
                    style={actionButtonStyle(styles.swapDiscardButton, !!players[currentPlayer].pendingCard)}
                    onClick={() => setPlayers((prev) => ({
                      ...prev,
                      [currentPlayer]: { ...prev[currentPlayer], swappingWithDiscard: !prev[currentPlayer].swappingWithDiscard }
                    }))}
                    disabled={!!players[currentPlayer].pendingCard}
                    title={players[currentPlayer].pendingCard ? "Resolve drawn card first" : "Swap a hand card with the top discard card"}
                  >
                    {players[currentPlayer].swappingWithDiscard ? "Cancel" : "Swap with Discard"}
                  </button>

                ) : null}
                <div style={styles.pileLabel}>
                    <div style={styles.pileName}>Discard</div>
                    <div style={styles.pileCount}>{discardPile.length} cards</div>
                </div>
                </div>
            </div>

            {/* Player hands section */}
            <div style={styles.playersSection}>
              <div style={styles.playerColumn}>
                <div style={styles.playerLabel}>Player 1{currentPlayer === 1 ? " (Your Turn)" : ""}</div>
                <div style={styles.handContainer}>
                  {players[1].hand.length > 0 ? (
                    <div style={players[1].hand.length < 4 ? styles.miniHandFlex : styles.miniHand}>
                      {players[1].hand.map((card, idx) => (
                        <div key={card.id} style={styles.miniCardWrapper}>
                          <div style={styles.miniCard}>
                            <button
                              style={actionButtonStyle(styles.stackButton, !!players[1].pendingCard || players[1].swappingWithDiscard)}
                              onClick={() => handleStack(1, idx)}
                              disabled={!!players[1].pendingCard || players[1].swappingWithDiscard}
                              title={
                                players[1].swappingWithDiscard
                                  ? "Cancel swap with discard first"
                                  : players[1].pendingCard
                                  ? "Resolve drawn card first"
                                  : "Stack this card"
                              }
                            >
                              Stack
                            </button>
                            <div
                              style={{
                                ...styles.miniCardText,
                                color: card.color === "red" ? "crimson" : "white",
                                filter: players[1].revealedCardId === card.id ? "none" : styles.miniCardText.filter,
                              }}
                            >
                              {card.rank}
                              {card.suit}
                            </div>
                          </div>
                          {currentPlayer === 1 && players[1].pendingCard ? (
                            <button style={styles.swapSmall} onClick={() => handleSwapWith(idx)}>
                              Swap
                            </button>
                          ) : null}
                          {currentPlayer === 1 && players[1].swappingWithDiscard ? (
                            <button style={styles.swapSmall} onClick={() => handleSwapWithDiscard(idx)}>
                              Swap with Discard
                            </button>
                          ) : null}
                          <PowerButton
                            power={SELF_PEEK}
                            activePower={players[1].activePower}
                            activePowerToken={players[1].activePowerToken}
                            activePowerExpiresAt={players[1].activePowerExpiresAt}
                            cardRevealExpiresAt={players[1].cardRevealExpiresAt}
                            revealedCardId={players[1].revealedCardId}
                            cardId={card.id}
                            onClick={() => {
                              const revealEnds = Date.now() + 4000;
                              setPlayers((prev) => ({
                                ...prev,
                                1: { ...prev[1], revealedCardId: card.id, activePower: null, activePowerToken: null, activePowerExpiresAt: null, cardRevealExpiresAt: revealEnds },
                              }));
                              setTimeout(() => {
                                setPlayers((prev) => ({ ...prev, 1: { ...prev[1], revealedCardId: null, cardRevealExpiresAt: null } }));
                              }, 4000);
                            }}
                            onClose={() => {
                              setPlayers((prev) => ({ ...prev, 1: { ...prev[1], revealedCardId: null, cardRevealExpiresAt: null } }));
                            }}
                          />
                          <PowerButton
                            power={OPPONENT_PEEK}
                            activePower={players[2].activePower}
                            activePowerToken={players[2].activePowerToken}
                            activePowerExpiresAt={players[2].activePowerExpiresAt}
                            cardRevealExpiresAt={players[1].cardRevealExpiresAt}
                            revealedCardId={players[1].revealedCardId}
                            cardId={card.id}
                            showClose={false}
                            onClick={() => {
                              const revealEnds = Date.now() + 4000;
                              setPlayers((prev) => ({
                                ...prev,
                                1: { ...prev[1], revealedCardId: card.id, cardRevealExpiresAt: revealEnds },
                                2: { ...prev[2], activePower: null, activePowerToken: null, activePowerExpiresAt: null },
                              }));
                              setTimeout(() => {
                                setPlayers((prev) => ({ 
                                  ...prev, 
                                  1: { ...prev[1], revealedCardId: null, cardRevealExpiresAt: null }
                                }));
                              }, 4000);
                            }}
                            onClose={() => {
                              setPlayers((prev) => ({ 
                                ...prev, 
                                1: { ...prev[1], revealedCardId: null, cardRevealExpiresAt: null }
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.cardPlaceholder}>No cards in hand</div>
                  )}
                </div>
              </div>

              <div style={styles.playerColumn}>
                <div style={styles.playerLabel}>Player 2{currentPlayer === 2 ? " (Your Turn)" : ""}</div>
                <div style={styles.handContainer}>
                  {players[2].hand.length > 0 ? (
                    <div style={players[2].hand.length < 4 ? styles.miniHandFlex : styles.miniHand}>
                      {players[2].hand.map((card, idx) => (
                        <div key={card.id} style={styles.miniCardWrapper}>
                          <div style={styles.miniCard}>
                            <button
                              style={actionButtonStyle(styles.stackButton, !!players[2].pendingCard || players[2].swappingWithDiscard)}
                              onClick={() => handleStack(2, idx)}
                              disabled={!!players[2].pendingCard || players[2].swappingWithDiscard}
                              title={
                                players[2].swappingWithDiscard
                                  ? "Cancel swap with discard first"
                                  : players[2].pendingCard
                                  ? "Resolve drawn card first"
                                  : "Stack this card"
                              }
                            >
                              Stack
                            </button>
                            <div
                              style={{
                                ...styles.miniCardText,
                                color: card.color === "red" ? "crimson" : "white",
                                filter: players[2].revealedCardId === card.id ? "none" : styles.miniCardText.filter,
                              }}
                            >
                              {card.rank}
                              {card.suit}
                            </div>
                          </div>
                          {currentPlayer === 2 && players[2].pendingCard ? (
                            <button style={styles.swapSmall} onClick={() => handleSwapWith(idx)}>
                              Swap
                            </button>
                          ) : null}
                          {currentPlayer === 2 && players[2].swappingWithDiscard ? (
                            <button style={styles.swapSmall} onClick={() => handleSwapWithDiscard(idx)}>
                              Swap with Discard
                            </button>
                          ) : null}
                          <PowerButton
                            power={SELF_PEEK}
                            activePower={players[2].activePower}
                            activePowerToken={players[2].activePowerToken}
                            activePowerExpiresAt={players[2].activePowerExpiresAt}
                            cardRevealExpiresAt={players[2].cardRevealExpiresAt}
                            revealedCardId={players[2].revealedCardId}
                            cardId={card.id}
                            onClick={() => {
                              const revealEnds = Date.now() + 4000;
                              setPlayers((prev) => ({
                                ...prev,
                                2: { ...prev[2], revealedCardId: card.id, activePower: null, activePowerToken: null, activePowerExpiresAt: null, cardRevealExpiresAt: revealEnds },
                              }));
                              setTimeout(() => {
                                setPlayers((prev) => ({ ...prev, 2: { ...prev[2], revealedCardId: null, cardRevealExpiresAt: null } }));
                              }, 4000);
                            }}
                            onClose={() => {
                              setPlayers((prev) => ({ ...prev, 2: { ...prev[2], revealedCardId: null, cardRevealExpiresAt: null } }));
                            }}
                          />
                          <PowerButton
                            power={OPPONENT_PEEK}
                            activePower={players[1].activePower}
                            activePowerToken={players[1].activePowerToken}
                            activePowerExpiresAt={players[1].activePowerExpiresAt}
                            cardRevealExpiresAt={players[2].cardRevealExpiresAt}
                            revealedCardId={players[2].revealedCardId}
                            cardId={card.id}
                            showClose={false}
                            onClick={() => {
                              const revealEnds = Date.now() + 4000;
                              setPlayers((prev) => ({
                                ...prev,
                                2: { ...prev[2], revealedCardId: card.id, cardRevealExpiresAt: revealEnds },
                                1: { ...prev[1], activePower: null, activePowerToken: null, activePowerExpiresAt: null },
                              }));
                              setTimeout(() => {
                                setPlayers((prev) => ({ 
                                  ...prev, 
                                  2: { ...prev[2], revealedCardId: null, cardRevealExpiresAt: null }
                                }));
                              }, 4000);
                            }}
                            onClose={() => {
                              setPlayers((prev) => ({ 
                                ...prev, 
                                2: { ...prev[2], revealedCardId: null, cardRevealExpiresAt: null }
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.cardPlaceholder}>No cards in hand</div>
                  )}
                </div>
              </div>
            </div>

            </div>
        </div>
        );
}

export default Game;

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background:
      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 35%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.06), transparent 40%), #0b1220",
  },

  table: {
    width: "min(1000px, 95vw)",
    minHeight: "min(650px, 90vh)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "radial-gradient(circle at 50% 40%, rgba(34,197,94,0.18), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  title: {
    margin: 0,
    fontSize: 28,
    letterSpacing: 0.2,
  },

  subtitle: {
    margin: 0,
    opacity: 0.75,
    fontSize: 14,
  },

  turnIndicator: {
    margin: 8,
    fontSize: 16,
    fontWeight: 700,
    color: "rgba(34, 197, 94, 0.9)",
  },

  centerArea: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr 1fr",
    gap: 18,
    alignItems: "center",
  },

  pile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  cardBack: {
    width: 120,
    height: 170,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.16)",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.25))",
    boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
    position: "relative",
    overflow: "hidden",
  },

  discardTop: {
    width: 120,
    height: 170,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
    boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pileLabel: {
    textAlign: "center",
  },

  pileName: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },

  pileCount: {
    opacity: 0.75,
    fontSize: 13,
    marginTop: 2,
  },

  currentSlot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  currentLabel: {
    opacity: 0.8,
    fontSize: 13,
    letterSpacing: 0.2,
  },

  cardFace: {
    width: 200,
    height: 290,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
    boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardText: {
    fontSize: 64,
    fontWeight: 800,
    letterSpacing: 1,
    textShadow: "0 10px 24px rgba(0,0,0,0.35)",
  },

  cardPlaceholder: {
    opacity: 0.6,
    fontSize: 16,
  },

  discardMiniText: {
    fontSize: 36,
    fontWeight: 800,
  },

  discardMiniPlaceholder: {
    opacity: 0.6,
    fontSize: 14,
  },

  controls: {
    display: "flex",
    gap: 12,
  },

  button: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    cursor: "pointer",
    fontWeight: 700,
  },

  buttonSecondary: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
    fontWeight: 700,
    opacity: 0.9,
  },

  handContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
  },

  miniHandFlex: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  miniHand: { 
    display: "grid", 
    gridTemplateColumns: "repeat(4, 90px)", 
    gap: 10, 
    justifyContent: "center", 
  },
  
  miniCard: {
    width: 90,
    height: 130,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
    position: "relative",
  },

  miniCardText: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: 0.8,
    color: "#2E2E2E",
    filter: "blur(3px)",
  },
  miniCardWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },

  stackButton: {
    position: "absolute",
    top: 4,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 8px",
    fontSize: 10,
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.3)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },

  swapSmall: {
    padding: "6px 10px",
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },

  swapDiscardButton: {
    padding: "8px 12px",
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },

  playersSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    padding: "20px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
};


