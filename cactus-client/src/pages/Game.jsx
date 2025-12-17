import { createShuffledDeck } from "../game/deck";
import { useState, useEffect } from "react";

function Game () {

    const [deck, setDeck] = useState(() => createShuffledDeck());
    const [discardPile, setDiscardPile] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [pendingCard, setPendingCard] = useState(null);
    const [hand, setHand] = useState([]);

    // Deal 4 cards at the start of the game
    useEffect(() => {
      setDeck((prevDeck) => {
        const newDeck = [...prevDeck];
        const initialHand = [];
        for (let i = 0; i < 4 && newDeck.length > 0; i++) {
          initialHand.push(newDeck.pop());
        }
        setHand(initialHand);
        return newDeck;
      });
    }, []);

    const handleDraw = () => {
      if (deck.length === 0 || pendingCard) return;
      const newDeck = [...deck];
      const drawnCard = newDeck.pop();
      setDeck(newDeck);
      setPendingCard(drawnCard);
      // clear the current card display when drawing
      setCurrentCard(null);
    };

    const handleDiscardPending = () => {
      if (!pendingCard) return;
      setDiscardPile((prev) => [...prev, pendingCard]);
      // do not show the discarded card as the current card
      setCurrentCard(null);
      setPendingCard(null);
    };

    const handleSwapWith = (index) => {
      if (!pendingCard) return;
      setHand((prev) => {
        const newHand = [...prev];
        const replaced = newHand[index];
        newHand[index] = pendingCard;
        // put replaced card into discard
        setDiscardPile((prevDiscard) => [...prevDiscard, replaced]);
        return newHand;
      });
      // do not show the swapped-in card as the current card
      setCurrentCard(null);
      setPendingCard(null);
    };

    const handleResetDeck = () => {
      const fresh = createShuffledDeck();
      const initialHand = [];
      for (let i = 0; i < 4 && fresh.length > 0; i++) {
        initialHand.push(fresh.pop());
      }
      setDeck(fresh);
      setHand(initialHand);
      setDiscardPile([]);
      setCurrentCard(null);
    };

    return (
        <div style={styles.page}>
            <div style={styles.table}>
            <header style={styles.header}>
                <h1 style={styles.title}>Card Test</h1>
                <p style={styles.subtitle}>Deck + discard + current card</p>
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
                  {pendingCard ? (
                  <div
                    style={{
                    ...styles.cardText,
                    color: pendingCard.color === "red" ? "crimson" : "white",
                    }}
                  >
                    {pendingCard.rank}
                    {pendingCard.suit}
                  </div>
                  ) : currentCard ? (
                  <div
                    style={{
                    ...styles.cardText,
                    color: currentCard.color === "red" ? "crimson" : "white",
                    }}
                  >
                    {currentCard.rank}
                    {currentCard.suit}
                  </div>
                  ) : (
                  <div style={styles.cardPlaceholder}>Draw to reveal</div>
                  )}
                </div>

                <div style={styles.controls}>
                    <button
                    style={styles.button}
                    onClick={handleDraw}
                    disabled={deck.length === 0 || !!pendingCard}
                    title={deck.length === 0 ? "Deck is empty" : pendingCard ? "Resolve drawn card first" : "Draw a card"}
                    >
                    Draw
                    </button>

                    <button style={styles.buttonSecondary} onClick={handleResetDeck}>
                    Reset
                    </button>

                    {pendingCard ? (
                      <button style={styles.button} onClick={handleDiscardPending} title="Discard drawn card">
                        Discard
                      </button>
                    ) : null}
                </div>
                {/* Player hand */}
                <div style={styles.handContainer}>
                  {hand.length > 0 ? (
                    <>
                        <div style={styles.miniHand}>
                          {hand.map((card, idx) => (
                            <div key={card.id} style={styles.miniCardWrapper}>
                              <div style={styles.miniCard}>
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
                              {pendingCard ? (
                                <button style={styles.swapSmall} onClick={() => handleSwapWith(idx)}>
                                  Swap
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                    </>
                  ) : (
                    <div style={styles.cardPlaceholder}>No cards in hand</div>
                  )}
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

                <div style={styles.pileLabel}>
                    <div style={styles.pileName}>Discard</div>
                    <div style={styles.pileCount}>{discardPile.length} cards</div>
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

  miniHand: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  
  miniCard: {
    width: 90,
    height: 130,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
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
};


