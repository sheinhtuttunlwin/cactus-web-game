import { createShuffledDeck } from "./deck";
import { getPowerForCard } from "./powers";

export function dealInitial({ setDeck, setDiscardPile, setPlayers, setCurrentPlayer, setHasStackedThisRound }) {
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
  setHasStackedThisRound(false);
  setPlayers({
    1: { hand: player1Hand, pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
    2: { hand: player2Hand, pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
  });
  setCurrentPlayer(1);
}

export function handleDraw({ deck, setDeck, players, setPlayers, currentPlayer }) {
  if (deck.length === 0 || players[currentPlayer].pendingCard) return;
  const newDeck = [...deck];
  const drawnCard = newDeck.pop();
  setDeck(newDeck);
  setPlayers((prev) => ({
    ...prev,
    [currentPlayer]: {
      ...prev[currentPlayer],
      pendingCard: drawnCard,
    },
  }));
}

export function handleDiscardPending({ players, setPlayers, currentPlayer, setDiscardPile, setHasStackedThisRound, setCurrentPlayer }) {
  const pendingCard = players[currentPlayer].pendingCard;
  if (!pendingCard) return;
  setDiscardPile((prev) => [...prev, pendingCard]);
  setHasStackedThisRound(false);
  // If the discarded card grants a power, give it to the player now and set an expiry token
  const power = getPowerForCard(pendingCard);
  if (power) {
    const token = `${Date.now()}-${Math.random()}`;
    const expiresAt = Date.now() + 10000;
    setPlayers((prev) => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], pendingCard: null, activePower: power, activePowerToken: token, activePowerExpiresAt: expiresAt, activePowerLabel: pendingCard.rank },
    }));
    // expire the power after 10s, but only if the token still matches
    const playerNum = currentPlayer;
    setTimeout(() => {
      setPlayers((prev) => {
        const p = prev[playerNum];
        if (!p) return prev;
        if (p.activePowerToken !== token) return prev;
        return { ...prev, [playerNum]: { ...p, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null } };
      });
    }, 10000);
  } else {
    setPlayers((prev) => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], pendingCard: null },
    }));
  }
  setCurrentPlayer((p) => (p === 1 ? 2 : 1));
}

export function handleSwapWith({ players, setPlayers, currentPlayer, index, setDiscardPile, setHasStackedThisRound, setCurrentPlayer }) {
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
  setHasStackedThisRound(false);
  setCurrentPlayer((p) => (p === 1 ? 2 : 1));
}

export function handleStack({ discardPile, players, setPlayers, playerNum, index, deck, setDeck, setHasStackedThisRound }) {
  const lastDiscardedCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const handCard = players[playerNum].hand[index];

  if (!lastDiscardedCard) {
    alert("No card to stack on (discard pile is empty)");
    return;
  }

  if (players[playerNum].hand.length === 1) {
    alert("You must keep at least 1 card in your hand");
    return;
  }

  if (handCard.rank === lastDiscardedCard.rank) {
    setPlayers((prev) => ({
      ...prev,
      [playerNum]: {
        ...prev[playerNum],
        hand: prev[playerNum].hand.filter((_, i) => i !== index),
      },
    }));
    return { success: true, card: handCard };
  } else {
    alert("does not match");
    const newDeck = [...deck];
    const cardsToAdd = [];
    for (let i = 0; i < 2 && newDeck.length > 0; i++) {
      cardsToAdd.push(newDeck.pop());
    }
    setDeck(newDeck);
    setPlayers((prev) => ({
      ...prev,
      [playerNum]: {
        ...prev[playerNum],
        hand: [...prev[playerNum].hand, ...cardsToAdd],
      },
    }));
    return { success: false };
  }
}

export function finalizeStack({ setDiscardPile, handCard, setHasStackedThisRound }) {
  if (handCard) {
    setDiscardPile((prev) => [...prev, handCard]);
    setHasStackedThisRound(true);
    // Stacking is a global interrupt and should NOT switch turns.
  }
}

export function handleSwapWithDiscard({ discardPile, players, setPlayers, currentPlayer, index, setDiscardPile, setHasStackedThisRound, setCurrentPlayer }) {
  const lastDiscardedCard = discardPile[discardPile.length - 1];
  const handCard = players[currentPlayer].hand[index];

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
  setHasStackedThisRound(false);
  setCurrentPlayer((p) => (p === 1 ? 2 : 1));
}

export function handleResetDeck({ setDeck, setPlayers, setDiscardPile, setCurrentPlayer, setHasStackedThisRound }) {
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
    1: { hand: player1Hand, pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
    2: { hand: player2Hand, pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
  });
  setDiscardPile(firstDiscardCard ? [firstDiscardCard] : []);
  setHasStackedThisRound(false);
  setCurrentPlayer(1);
}

