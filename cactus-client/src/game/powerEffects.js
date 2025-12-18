import { SWAP_ANY } from "./powers";

/**
 * Activates self-peek power: reveals the player's own card for 4 seconds
 */
export const activateSelfPeek = (playerId, cardId, setPlayers) => {
  const revealEnds = Date.now() + 4000;
  setPlayers((prev) => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      revealedCardId: cardId,
      activePower: null,
      activePowerToken: null,
      activePowerExpiresAt: null,
      activePowerLabel: null,
      cardRevealExpiresAt: revealEnds,
    },
  }));
  setTimeout(() => {
    setPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        revealedCardId: null,
        cardRevealExpiresAt: null,
      },
    }));
  }, 4000);
};

/**
 * Activates opponent-peek power: reveals the opponent's card for 4 seconds
 */
export const activateOpponentPeek = (targetPlayerId, activatingPlayerId, cardId, setPlayers) => {
  const revealEnds = Date.now() + 4000;
  setPlayers((prev) => ({
    ...prev,
    [targetPlayerId]: {
      ...prev[targetPlayerId],
      revealedCardId: cardId,
      cardRevealExpiresAt: revealEnds,
    },
    [activatingPlayerId]: {
      ...prev[activatingPlayerId],
      activePower: null,
      activePowerToken: null,
      activePowerExpiresAt: null,
      activePowerLabel: null,
    },
  }));
  setTimeout(() => {
    setPlayers((prev) => ({
      ...prev,
      [targetPlayerId]: {
        ...prev[targetPlayerId],
        revealedCardId: null,
        cardRevealExpiresAt: null,
      },
    }));
  }, 4000);
};

/**
 * Closes card reveal early
 */
export const closeCardReveal = (playerId, setPlayers) => {
  setPlayers((prev) => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      revealedCardId: null,
      cardRevealExpiresAt: null,
    },
  }));
};

/**
 * Initiates or continues swap-any card selection
 */
export const handleSwapAnySelection = (playerId, cardIndex, cardId, players, swapFirstCard, swapAnimation, setSwapFirstCard, setSwapAnimation) => {
  const swapPowerActive = players[1].activePower === SWAP_ANY || players[2].activePower === SWAP_ANY;
  if (!swapPowerActive) return;

  if (swapAnimation) return; // ignore clicks while animating

  if (!swapFirstCard) {
    setSwapFirstCard({ playerId, cardIndex, cardId });
    return;
  }

  // same card clicked -> cancel
  if (swapFirstCard.playerId === playerId && swapFirstCard.cardIndex === cardIndex) {
    setSwapFirstCard(null);
    return;
  }

  // start swap animation
  const duration = 360; // ms
  const anim = {
    from: swapFirstCard,
    to: { playerId, cardIndex, cardId },
    start: Date.now(),
    duration,
    progress: 0,
    done: false,
  };
  setSwapAnimation(anim);
};

/**
 * Executes the actual swap and clears SWAP_ANY power
 */
export const executeSwap = (from, to, setPlayers) => {
  setPlayers((prev) => {
    const next = { ...prev };

    const pAId = from.playerId;
    const pBId = to.playerId;

    const pA = { ...next[pAId], hand: [...next[pAId].hand] };
    const pB = { ...next[pBId], hand: [...next[pBId].hand] };

    const cardA = pA.hand[from.cardIndex];
    const cardB = pB.hand[to.cardIndex];

    pA.hand[from.cardIndex] = cardB;
    pB.hand[to.cardIndex] = cardA;

    next[pAId] = pA;
    next[pBId] = pB;

    // Clear SWAP_ANY power from whoever had it
    Object.keys(next).forEach((id) => {
      const pid = Number(id);
      if (next[pid].activePower === SWAP_ANY) {
        next[pid] = {
          ...next[pid],
          activePower: null,
          activePowerToken: null,
          activePowerExpiresAt: null,
          activePowerLabel: null,
        };
      }
    });

    return next;
  });
};

/**
 * Manages the swap animation lifecycle
 */
export const runSwapAnimation = (swapAnimation, setSwapAnimation, setPlayers, setSwapFirstCard) => {
  if (!swapAnimation) return;

  const { from, to, start, duration } = swapAnimation;
  let swapped = false;

  const id = setInterval(() => {
    const now = Date.now();
    const progress = Math.min(1, (now - start) / duration);
    setSwapAnimation((prev) => (prev ? { ...prev, progress } : prev));

    // perform actual swap at halfway point
    if (progress >= 0.5 && !swapped) {
      swapped = true;
      executeSwap(from, to, setPlayers);
      setSwapAnimation((prev) => (prev ? { ...prev, done: true } : prev));
    }

    if (progress >= 1) {
      clearInterval(id);
      setSwapAnimation(null);
      setSwapFirstCard(null);
    }
  }, 40);

  return () => clearInterval(id);
};
