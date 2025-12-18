import * as actions from "../game/actions";
import { SELF_PEEK, OPPONENT_PEEK, SWAP_ANY } from "../game/powers";
import { useState, useEffect } from "react";
import { PowerTimeIndicator, PowerButton, RevealProgressBar } from "../components/power/PowerUI";
import * as powerEffects from "../game/powerEffects";

function Game () {

    const [deck, setDeck] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [hasStackedThisRound, setHasStackedThisRound] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
    const [swapFirstCard, setSwapFirstCard] = useState(null); // { playerId, cardIndex, cardId }
    const [swapAnimation, setSwapAnimation] = useState(null); // { from, to, start, duration, progress }
    const [powerUiOpenByPlayer, setPowerUiOpenByPlayer] = useState({ 1: false, 2: false });
    const [cactusCalledBy, setCactusCalledBy] = useState(null); // null, 1, or 2
    const [roundOver, setRoundOver] = useState(false);
    const [players, setPlayers] = useState({
      1: { hand: [], pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
      2: { hand: [], pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
    });

    const powerOwnerId = players[1].activePower ? 1 : players[2].activePower ? 2 : null;
    const powerOwner = powerOwnerId ? players[powerOwnerId] : null;
    const powerVariant = powerOwner?.activePower === SWAP_ANY ? "swap" : powerOwner?.activePower === OPPONENT_PEEK ? "opponent" : powerOwner?.activePower ? "self" : "swap";
    const powerLabel = powerOwner?.activePowerLabel || (powerOwner?.activePower === SWAP_ANY ? "Q" : powerOwner?.activePower === OPPONENT_PEEK ? "9/10/J" : powerOwner?.activePower ? "6/7/8" : "");

    // Ensure each player's toggle starts closed when their power changes or expires
    useEffect(() => {
      setPowerUiOpenByPlayer((prev) => ({ ...prev, 1: false }));
    }, [players[1].activePower, players[1].activePowerExpiresAt]);

    useEffect(() => {
      setPowerUiOpenByPlayer((prev) => ({ ...prev, 2: false }));
    }, [players[2].activePower, players[2].activePowerExpiresAt]);

    // Clear all active powers when round ends
    useEffect(() => {
      if (roundOver) {
        setPlayers((prev) => ({
          1: {
            ...prev[1],
            activePower: null,
            activePowerToken: null,
            activePowerExpiresAt: null,
            activePowerLabel: null,
          },
          2: {
            ...prev[2],
            activePower: null,
            activePowerToken: null,
            activePowerExpiresAt: null,
            activePowerLabel: null,
          },
        }));
      }
    }, [roundOver]);

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
      // Check if this player called Cactus before their turn ends
      const callerFinishingTurn = cactusCalledBy === currentPlayer;
      
      actions.handleDiscardPending({ players, setPlayers, currentPlayer, setDiscardPile, setHasStackedThisRound, setCurrentPlayer });
      
      // If the player who called Cactus just finished, the next turn will be the final one
      // If someone else called Cactus and this is not the caller's turn, the round ends
      if (cactusCalledBy !== null && !callerFinishingTurn) {
        setRoundOver(true);
      }
    };

    const handleSwapWith = (index) => {
      const callerFinishingTurn = cactusCalledBy === currentPlayer;
      actions.handleSwapWith({ players, setPlayers, currentPlayer, index, setDiscardPile, setHasStackedThisRound, setCurrentPlayer });
      
      if (cactusCalledBy !== null && !callerFinishingTurn) {
        setRoundOver(true);
      }
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
      const callerFinishingTurn = cactusCalledBy === currentPlayer;
      actions.handleSwapWithDiscard({ discardPile, players, setPlayers, currentPlayer, index, setDiscardPile, setHasStackedThisRound, setCurrentPlayer });
      
      if (cactusCalledBy !== null && !callerFinishingTurn) {
        setRoundOver(true);
      }
    };

    const handleSwapAnyCard = (playerId, cardIndex, cardId) => {
      powerEffects.handleSwapAnySelection(
        playerId,
        cardIndex,
        cardId,
        players,
        swapFirstCard,
        swapAnimation,
        setSwapFirstCard,
        setSwapAnimation
      );
    };


    const handleResetDeck = () => {
      actions.handleResetDeck({ setDeck, setPlayers, setDiscardPile, setCurrentPlayer, setHasStackedThisRound });
      setCactusCalledBy(null);
      setRoundOver(false);
    };

    const handleCactus = () => {
      setCactusCalledBy(currentPlayer);
      // Don't switch turns yet - let the current player finish their turn
    };

    useEffect(() => {
      return powerEffects.runSwapAnimation(
        swapAnimation,
        setSwapAnimation,
        setPlayers,
        setSwapFirstCard
      );
    }, [swapAnimation]);

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
                {roundOver ? (
                  <p style={styles.roundOverIndicator}>🌵 Round Over! Player {cactusCalledBy} called Cactus</p>
                ) : cactusCalledBy ? (
                  <p style={styles.finalRoundIndicator}>Final Round! Player {currentPlayer}'s last turn</p>
                ) : (
                  <p style={styles.turnIndicator}>Player {currentPlayer}'s Turn</p>
                )}
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
                {!cactusCalledBy && !roundOver ? (
                  <button style={styles.cactusButton} onClick={handleCactus} title="Call Cactus to end the round">
                    🌵 Cactus
                  </button>
                ) : null}
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
                      style={actionButtonStyle(styles.button, deck.length === 0 || !!players[currentPlayer].pendingCard || players[currentPlayer].swappingWithDiscard || roundOver)}
                      onClick={handleDraw}
                      disabled={deck.length === 0 || !!players[currentPlayer].pendingCard || players[currentPlayer].swappingWithDiscard || roundOver}
                      title={
                        roundOver
                          ? "Round is over"
                          : players[currentPlayer].swappingWithDiscard
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
                    style={actionButtonStyle(styles.swapDiscardButton, !!players[currentPlayer].pendingCard || roundOver)}
                    onClick={() => setPlayers((prev) => ({
                      ...prev,
                      [currentPlayer]: { ...prev[currentPlayer], swappingWithDiscard: !prev[currentPlayer].swappingWithDiscard }
                    }))}
                    disabled={!!players[currentPlayer].pendingCard || roundOver}
                    title={roundOver ? "Round is over" : players[currentPlayer].pendingCard ? "Resolve drawn card first" : "Swap a hand card with the top discard card"}
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
                <div style={styles.playerLabel}>
                  <span>Player 1{currentPlayer === 1 ? " (Your Turn)" : ""}</span>
                  {players[1].activePower && players[1].activePowerExpiresAt ? (
                    <PowerTimeIndicator
                      expiresAt={players[1].activePowerExpiresAt}
                      label={
                        players[1].activePowerLabel ||
                        (players[1].activePower === SWAP_ANY
                          ? "Q"
                          : players[1].activePower === OPPONENT_PEEK
                          ? "9/10/J"
                          : "6/7/8")
                      }
                      variant={
                        players[1].activePower === SWAP_ANY
                          ? "swap"
                          : players[1].activePower === OPPONENT_PEEK
                          ? "opponent"
                          : "self"
                      }
                      onClick={() =>
                        setPowerUiOpenByPlayer((prev) => ({ ...prev, 1: !prev[1] }))
                      }
                    />
                  ) : null}
                </div>
                <div style={styles.handContainer}>
                  {players[1].hand.length > 0 ? (
                    <div style={players[1].hand.length < 4 ? styles.miniHandFlex : styles.miniHand}>
                      {players[1].hand.map((card, idx) => {
                        const isCardSelected = swapFirstCard && swapFirstCard.playerId === 1 && swapFirstCard.cardIndex === idx;
                        const cardAnimStyle = (() => {
                          if (!swapAnimation) return {};
                          const { from, to, progress } = swapAnimation;
                          const isFrom = from.playerId === 1 && from.cardIndex === idx;
                          const isTo = to.playerId === 1 && to.cardIndex === idx;
                          if (!isFrom && !isTo) return {};

                          const offset = 28; // px to move down
                          const half = 0.5;
                          if (progress < half) {
                            const t = Math.min(1, progress / half);
                            const translateY = t * offset; // move down
                            const opacity = 1 - t;
                            return { transform: `translateY(${translateY}px)`, opacity };
                          }
                          // after swap: come up from below into place
                          const t = Math.min(1, (progress - half) / half);
                          const translateY = (1 - t) * offset; // from offset -> 0
                          const opacity = t;
                          return { transform: `translateY(${translateY}px)`, opacity };
                        })();

                        return (
                        <div key={card.id} style={{
                          ...styles.miniCardWrapper,
                          position: "relative",
                        }}>
                          {/* Timer is shown next to player label; no minicard timer overlay */}
                          <div style={{...styles.miniCard, ...(isCardSelected ? styles.selectedMiniCard : {}), ...cardAnimStyle}}>
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
                                filter: players[1].revealedCardId === card.id || roundOver ? "none" : styles.miniCardText.filter,
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
                          {players[1].cardRevealExpiresAt && players[1].revealedCardId === card.id ? (
                            <RevealProgressBar
                              expiresAt={players[1].cardRevealExpiresAt}
                              onClick={() => powerEffects.closeCardReveal(1, setPlayers)}
                            />
                          ) : null}
                          {powerUiOpenByPlayer[1] && players[1].activePower === SELF_PEEK ? (
                          <PowerButton
                            power={SELF_PEEK}
                            activePower={players[1].activePower}
                            activePowerToken={players[1].activePowerToken}
                            activePowerExpiresAt={players[1].activePowerExpiresAt}
                            cardRevealExpiresAt={players[1].cardRevealExpiresAt}
                            revealedCardId={players[1].revealedCardId}
                            cardId={card.id}
                            onClick={() => powerEffects.activateSelfPeek(1, card.id, setPlayers)}
                            onClose={() => powerEffects.closeCardReveal(1, setPlayers)}
                          />
                          ) : null}
                          {powerUiOpenByPlayer[2] && players[2].activePower === OPPONENT_PEEK ? (
                          <PowerButton
                            power={OPPONENT_PEEK}
                            activePower={players[2].activePower}
                            activePowerToken={players[2].activePowerToken}
                            activePowerExpiresAt={players[2].activePowerExpiresAt}
                            cardRevealExpiresAt={players[1].cardRevealExpiresAt}
                            revealedCardId={players[1].revealedCardId}
                            cardId={card.id}
                            showClose={false}
                            onClick={() => powerEffects.activateOpponentPeek(1, 2, card.id, setPlayers)}
                            onClose={() => powerEffects.closeCardReveal(1, setPlayers)}
                          />
                          ) : null}
                          {isCardSelected ? (
                            <button
                              style={styles.cancelSelect}
                              onClick={() => setSwapFirstCard(null)}
                              title="Cancel selection"
                            >
                              ×
                            </button>
                          ) : null}
                          {((players[1].activePower === SWAP_ANY && powerUiOpenByPlayer[1]) || (players[2].activePower === SWAP_ANY && powerUiOpenByPlayer[2])) ? (
                          <PowerButton
                            power={SWAP_ANY}
                            activePower={players[1].activePower === SWAP_ANY ? SWAP_ANY : players[2].activePower === SWAP_ANY ? SWAP_ANY : null}
                            activePowerToken={players[1].activePower === SWAP_ANY ? players[1].activePowerToken : players[2].activePower === SWAP_ANY ? players[2].activePowerToken : null}
                            swapProgress={(() => {
                              if (swapAnimation) {
                                const isFrom = swapAnimation.from.playerId === 1 && swapAnimation.from.cardIndex === idx;
                                const isTo = swapAnimation.to.playerId === 1 && swapAnimation.to.cardIndex === idx;
                                return isFrom || isTo ? swapAnimation.progress : 0;
                              }
                              return swapFirstCard && swapFirstCard.playerId === 1 && swapFirstCard.cardIndex === idx ? 0.5 : 0;
                            })()}
                            isSelected={swapFirstCard && swapFirstCard.playerId === 1 && swapFirstCard.cardIndex === idx}
                            hideIfOwnerSelected={swapFirstCard && swapFirstCard.playerId === 1}
                            onClick={() => handleSwapAnyCard(1, idx, card.id)}
                          />
                          ) : null}
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <div style={styles.cardPlaceholder}>No cards in hand</div>
                  )}
                </div>
              </div>

              <div style={styles.playerColumn}>
                <div style={styles.playerLabel}>
                  <span>Player 2{currentPlayer === 2 ? " (Your Turn)" : ""}</span>
                  {players[2].activePower && players[2].activePowerExpiresAt ? (
                    <PowerTimeIndicator
                      expiresAt={players[2].activePowerExpiresAt}
                      label={
                        players[2].activePowerLabel ||
                        (players[2].activePower === SWAP_ANY
                          ? "Q"
                          : players[2].activePower === OPPONENT_PEEK
                          ? "9/10/J"
                          : "6/7/8")
                      }
                      variant={
                        players[2].activePower === SWAP_ANY
                          ? "swap"
                          : players[2].activePower === OPPONENT_PEEK
                          ? "opponent"
                          : "self"
                      }
                      onClick={() =>
                        setPowerUiOpenByPlayer((prev) => ({ ...prev, 2: !prev[2] }))
                      }
                    />
                  ) : null}
                </div>
                <div style={styles.handContainer}>
                  {players[2].hand.length > 0 ? (
                    <div style={players[2].hand.length < 4 ? styles.miniHandFlex : styles.miniHand}>
                      {players[2].hand.map((card, idx) => {
                        const isCardSelected = swapFirstCard && swapFirstCard.playerId === 2 && swapFirstCard.cardIndex === idx;
                        const cardAnimStyle = (() => {
                          if (!swapAnimation) return {};
                          const { from, to, progress } = swapAnimation;
                          const isFrom = from.playerId === 2 && from.cardIndex === idx;
                          const isTo = to.playerId === 2 && to.cardIndex === idx;
                          if (!isFrom && !isTo) return {};

                          const offset = 28; // px to move down
                          const half = 0.5;
                          if (progress < half) {
                            const t = Math.min(1, progress / half);
                            const translateY = t * offset; // move down
                            const opacity = 1 - t;
                            return { transform: `translateY(${translateY}px)`, opacity };
                          }
                          // after swap: come up from below into place
                          const t = Math.min(1, (progress - half) / half);
                          const translateY = (1 - t) * offset; // from offset -> 0
                          const opacity = t;
                          return { transform: `translateY(${translateY}px)`, opacity };
                        })();

                        return (
                        <div key={card.id} style={{
                          ...styles.miniCardWrapper,
                          position: "relative",
                        }}>
                          {/* Timer is shown next to player label; no minicard timer overlay */}
                          <div style={{...styles.miniCard, ...(isCardSelected ? styles.selectedMiniCard : {}), ...cardAnimStyle}}>
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
                                filter: players[2].revealedCardId === card.id || roundOver ? "none" : styles.miniCardText.filter,
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
                          {players[2].cardRevealExpiresAt && players[2].revealedCardId === card.id ? (
                            <RevealProgressBar
                              expiresAt={players[2].cardRevealExpiresAt}
                              onClick={() => powerEffects.closeCardReveal(2, setPlayers)}
                            />
                          ) : null}
                          {powerUiOpenByPlayer[2] && players[2].activePower === SELF_PEEK ? (
                          <PowerButton
                            power={SELF_PEEK}
                            activePower={players[2].activePower}
                            activePowerToken={players[2].activePowerToken}
                            activePowerExpiresAt={players[2].activePowerExpiresAt}
                            cardRevealExpiresAt={players[2].cardRevealExpiresAt}
                            revealedCardId={players[2].revealedCardId}
                            cardId={card.id}
                            onClick={() => powerEffects.activateSelfPeek(2, card.id, setPlayers)}
                            onClose={() => powerEffects.closeCardReveal(2, setPlayers)}
                          />
                          ) : null}
                          {powerUiOpenByPlayer[1] && players[1].activePower === OPPONENT_PEEK ? (
                          <PowerButton
                            power={OPPONENT_PEEK}
                            activePower={players[1].activePower}
                            activePowerToken={players[1].activePowerToken}
                            activePowerExpiresAt={players[1].activePowerExpiresAt}
                            cardRevealExpiresAt={players[2].cardRevealExpiresAt}
                            revealedCardId={players[2].revealedCardId}
                            cardId={card.id}
                            showClose={false}
                            onClick={() => powerEffects.activateOpponentPeek(2, 1, card.id, setPlayers)}
                            onClose={() => powerEffects.closeCardReveal(2, setPlayers)}
                          />
                          ) : null}
                          {isCardSelected ? (
                            <button
                              style={styles.cancelSelect}
                              onClick={() => setSwapFirstCard(null)}
                              title="Cancel selection"
                            >
                              ×
                            </button>
                          ) : null}
                          {((players[1].activePower === SWAP_ANY && powerUiOpenByPlayer[1]) || (players[2].activePower === SWAP_ANY && powerUiOpenByPlayer[2])) ? (
                          <PowerButton
                            power={SWAP_ANY}
                            activePower={players[1].activePower === SWAP_ANY ? SWAP_ANY : players[2].activePower === SWAP_ANY ? SWAP_ANY : null}
                            activePowerToken={players[1].activePower === SWAP_ANY ? players[1].activePowerToken : players[2].activePower === SWAP_ANY ? players[2].activePowerToken : null}
                            swapProgress={(() => {
                              if (swapAnimation) {
                                const isFrom = swapAnimation.from.playerId === 2 && swapAnimation.from.cardIndex === idx;
                                const isTo = swapAnimation.to.playerId === 2 && swapAnimation.to.cardIndex === idx;
                                return isFrom || isTo ? swapAnimation.progress : 0;
                              }
                              return swapFirstCard && swapFirstCard.playerId === 2 && swapFirstCard.cardIndex === idx ? 0.5 : 0;
                            })()}
                            isSelected={swapFirstCard && swapFirstCard.playerId === 2 && swapFirstCard.cardIndex === idx}
                            hideIfOwnerSelected={swapFirstCard && swapFirstCard.playerId === 2}
                            onClick={() => handleSwapAnyCard(2, idx, card.id)}
                          />
                          ) : null}
                        </div>
                      );
                      })}
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

  finalRoundIndicator: {
    margin: 8,
    fontSize: 16,
    fontWeight: 700,
    color: "rgba(251, 191, 36, 0.9)",
  },

  roundOverIndicator: {
    margin: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "rgba(239, 68, 68, 0.9)",
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

  cactusButton: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.3)",
    background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.08))",
    cursor: "pointer",
    fontWeight: 700,
    color: "#dcfce7",
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
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
    transition: "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
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

  cancelSelect: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(255,165,0,0.14)",
  },

  selectedMiniCard: {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 48px rgba(255,165,0,0.14), 0 8px 28px rgba(0,0,0,0.45)",
    filter: "drop-shadow(0 6px 18px rgba(255,165,0,0.18))",
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


