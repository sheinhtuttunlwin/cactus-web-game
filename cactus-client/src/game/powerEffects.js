import { SWAP_ANY, SELF_PEEK, OPPONENT_PEEK } from "./powers";

/**
 * Activates self-peek power: reveals the player's own card for 4 seconds
 */
export const activateSelfPeek = (playerId, cardId, setPlayers) => {
  const revealEnds = Date.now() + 4000;
  // Validate active power state atomically
  setPlayers((prev) => {
    const p = prev[playerId];
    if (
      !p ||
      p.activePower !== SELF_PEEK ||
      !p.activePowerToken ||
      !p.activePowerExpiresAt ||
      Date.now() >= p.activePowerExpiresAt
    ) {
      return prev; // invalid or expired power; ignore
    }
    return {
      ...prev,
      [playerId]: {
        ...p,
        revealedCardId: cardId,
        activePower: null,
        activePowerToken: null,
        activePowerExpiresAt: null,
        activePowerLabel: null,
        cardRevealExpiresAt: revealEnds,
      },
    };
  });
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
  // Validate the activating player's power atomically
  setPlayers((prev) => {
    const activator = prev[activatingPlayerId];
    const target = prev[targetPlayerId];
    if (
      !activator ||
      activator.activePower !== OPPONENT_PEEK ||
      !activator.activePowerToken ||
      !activator.activePowerExpiresAt ||
      Date.now() >= activator.activePowerExpiresAt
    ) {
      return prev; // invalid or expired power; ignore
    }
    return {
      ...prev,
      [targetPlayerId]: {
        ...target,
        revealedCardId: cardId,
        cardRevealExpiresAt: revealEnds,
      },
      [activatingPlayerId]: {
        ...activator,
        activePower: null,
        activePowerToken: null,
        activePowerExpiresAt: null,
        activePowerLabel: null,
      },
    };
  });
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
  const holder = players[1].activePower === SWAP_ANY ? players[1] : players[2].activePower === SWAP_ANY ? players[2] : null;
  if (!holder) return;
  // Ensure valid token and not expired
  if (!holder.activePowerToken || !holder.activePowerExpiresAt || Date.now() >= holder.activePowerExpiresAt) return;
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
    // Validate players and indices to avoid out-of-bounds during resets/animations
    const pAId = from?.playerId;
    const pBId = to?.playerId;
    if (pAId == null || pBId == null) return prev;

    const pAOrig = prev[pAId];
    const pBOrig = prev[pBId];
    if (!pAOrig || !pBOrig) return prev;
    if (!Array.isArray(pAOrig.hand) || !Array.isArray(pBOrig.hand)) return prev;
    if (
      typeof from.cardIndex !== "number" ||
      typeof to.cardIndex !== "number" ||
      from.cardIndex < 0 ||
      to.cardIndex < 0 ||
      from.cardIndex >= pAOrig.hand.length ||
      to.cardIndex >= pBOrig.hand.length
    ) {
      return prev;
    }

    const next = { ...prev };
    const pA = { ...pAOrig, hand: [...pAOrig.hand] };
    const pB = { ...pBOrig, hand: [...pBOrig.hand] };

    const cardA = pA.hand[from.cardIndex];
    const cardB = pB.hand[to.cardIndex];
    if (!cardA || !cardB) return prev;

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
