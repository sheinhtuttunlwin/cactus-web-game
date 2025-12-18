import { createShuffledDeck } from "./deck";

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
    1: { hand: player1Hand, pendingCard: null, swappingWithDiscard: false },
    2: { hand: player2Hand, pendingCard: null, swappingWithDiscard: false },
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
    [currentPlayer]: { ...prev[currentPlayer], pendingCard: drawnCard },
  }));
}

export function handleDiscardPending({ players, setPlayers, currentPlayer, setDiscardPile, setHasStackedThisRound, setCurrentPlayer }) {
  const pendingCard = players[currentPlayer].pendingCard;
  if (!pendingCard) return;
  setDiscardPile((prev) => [...prev, pendingCard]);
  setHasStackedThisRound(false);
  setPlayers((prev) => ({
    ...prev,
    [currentPlayer]: { ...prev[currentPlayer], pendingCard: null },
  }));
  setTimeout(() => setCurrentPlayer((p) => (p === 1 ? 2 : 1)), 0);
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
  setTimeout(() => setCurrentPlayer((p) => (p === 1 ? 2 : 1)), 0);
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
  setTimeout(() => setCurrentPlayer((p) => (p === 1 ? 2 : 1)), 0);
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
    1: { hand: player1Hand, pendingCard: null, swappingWithDiscard: false },
    2: { hand: player2Hand, pendingCard: null, swappingWithDiscard: false },
  });
  setDiscardPile(firstDiscardCard ? [firstDiscardCard] : []);
  setHasStackedThisRound(false);
  setCurrentPlayer(1);
}

export function switchTurn(setCurrentPlayer) {
  setCurrentPlayer((p) => (p === 1 ? 2 : 1));
}
