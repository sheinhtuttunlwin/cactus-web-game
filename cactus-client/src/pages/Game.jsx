import { createShuffledDeck } from "../game/deck";
import { useState, useEffect } from "react";

function Game () {

    const [deck, setDeck] = useState(() => createShuffledDeck());
    const [discardPile, setDiscardPile] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
    const [players, setPlayers] = useState({
      1: { hand: [], pendingCard: null, swappingWithDiscard: false },
      2: { hand: [], pendingCard: null, swappingWithDiscard: false },
    });

    // Deal 4 cards to each player at game start and put one card in discard pile
    useEffect(() => {
      const fresh = createShuffledDeck();

      const firstDiscardCard = fresh.pop();
      const player1Hand = [];
      const player2Hand = [];

      for (let i = 0; i < 4 && fresh.length > 0; i++) {
        player1Hand.push(fresh.pop());
      }
      for (let i = 0; i < 4 && fresh.length > 0; i++) {
        player2Hand.push(fresh.pop());
      }

      setDeck(fresh);
      setDiscardPile(firstDiscardCard ? [firstDiscardCard] : []);
      setPlayers({
        1: { hand: player1Hand, pendingCard: null, swappingWithDiscard: false },
        2: { hand: player2Hand, pendingCard: null, swappingWithDiscard: false },
      });
      setCurrentPlayer(1);
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
      if (deck.length === 0 || players[currentPlayer].pendingCard) return;
      const newDeck = [...deck];
      const drawnCard = newDeck.pop();
      setDeck(newDeck);
      setPlayers((prev) => ({
        ...prev,
        [currentPlayer]: { ...prev[currentPlayer], pendingCard: drawnCard },
      }));
    };

    const handleDiscardPending = () => {
      const pendingCard = players[currentPlayer].pendingCard;
      if (!pendingCard) return;
      setDiscardPile((prev) => [...prev, pendingCard]);
      setPlayers((prev) => ({
        ...prev,
        [currentPlayer]: { ...prev[currentPlayer], pendingCard: null },
      }));
      setTimeout(switchTurn, 0);
    };

    const handleSwapWith = (index) => {
      const pendingCard = players[currentPlayer].pendingCard;
      if (!pendingCard) return;

      const replaced = players[currentPlayer].hand[index];
      setPlayers((prev) => {
        const newHand = [...prev[currentPlayer].hand];
        newHand[index] = pendingCard;
        return {
          ...prev,
          [currentPlayer]: { ...prev[currentPlayer], hand: newHand, pendingCard: null },
        };
      });
      setDiscardPile((prev) => [...prev, replaced]);
      setTimeout(switchTurn, 0);
    };


    const handleStack = (index) => {
      const lastDiscardedCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
      const handCard = players[currentPlayer].hand[index];
      
      if (!lastDiscardedCard) {
        alert("No card to stack on (discard pile is empty)");
        return;
      }

      // Guard: must always have at least 1 card in hand
      if (players[currentPlayer].hand.length === 1) {
        alert("You must keep at least 1 card in your hand");
        return;
      }
      
      if (handCard.rank === lastDiscardedCard.rank) {
        // ranks match, discard the hand card
        setPlayers((prev) => ({
          ...prev,
          [currentPlayer]: {
            ...prev[currentPlayer],
            hand: prev[currentPlayer].hand.filter((_, i) => i !== index),
          },
        }));
        setDiscardPile((prev) => [...prev, handCard]);
      } else {
        // ranks don't match, add 2 cards from deck to hand as penalty
        alert("does not match");
        const newDeck = [...deck];
        const cardsToAdd = [];
        for (let i = 0; i < 2 && newDeck.length > 0; i++) {
          cardsToAdd.push(newDeck.pop());
        }
        setDeck(newDeck);
        setPlayers((prev) => ({
          ...prev,
          [currentPlayer]: {
            ...prev[currentPlayer],
            hand: [...prev[currentPlayer].hand, ...cardsToAdd],
          },
        }));
      }
    };

    const handleSwapWithDiscard = (index) => {
      const lastDiscardedCard = discardPile[discardPile.length - 1];
      const handCard = players[currentPlayer].hand[index];

      // Swap: hand card goes to discard, discard card goes to hand
      setPlayers((prev) => {
        const newHand = [...prev[currentPlayer].hand];
        newHand[index] = lastDiscardedCard;
        return {
          ...prev,
          [currentPlayer]: { ...prev[currentPlayer], hand: newHand, swappingWithDiscard: false },
        };
      });

      setDiscardPile((prev) => {
        const newPile = [...prev];
        newPile[newPile.length - 1] = handCard;
        return newPile;
      });
      setTimeout(switchTurn, 0);
    };

    const handleResetDeck = () => {
      const fresh = createShuffledDeck();

      const firstDiscardCard = fresh.pop();
      const player1Hand = [];
      const player2Hand = [];

      for (let i = 0; i < 4 && fresh.length > 0; i++) {
        player1Hand.push(fresh.pop());
      }
      for (let i = 0; i < 4 && fresh.length > 0; i++) {
        player2Hand.push(fresh.pop());
      }

      setDeck(fresh);
      setPlayers({
        1: { hand: player1Hand, pendingCard: null, swappingWithDiscard: false },
        2: { hand: player2Hand, pendingCard: null, swappingWithDiscard: false },
      });
      setDiscardPile(firstDiscardCard ? [firstDiscardCard] : []);
      setCurrentPlayer(1);
    };

    const actionButtonStyle = (baseStyle, disabled) => ({
      ...baseStyle,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    });

    const switchTurn = () => {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    };

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
                            {currentPlayer === 1 && (
                              <button
                                style={actionButtonStyle(styles.stackButton, !!players[1].pendingCard || players[1].swappingWithDiscard)}
                                onClick={() => handleStack(idx)}
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
                            )}
                            <div
                              style={{
                                ...styles.miniCardText,
                                color: card.color === "red" ? "crimson" : "white",
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
                            {currentPlayer === 2 && (
                              <button
                                style={actionButtonStyle(styles.stackButton, !!players[2].pendingCard || players[2].swappingWithDiscard)}
                                onClick={() => handleStack(idx)}
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
                            )}
                            <div
                              style={{
                                ...styles.miniCardText,
                                color: card.color === "red" ? "crimson" : "white",
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


