import { createServer } from 'http';
import { Server } from 'socket.io';
import { RoomManager } from './roomManager.js';
import { createShuffledDeck } from './game/deck.js';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const rooms = new RoomManager();

const POWER = {
  SELF_PEEK: 'SELF_PEEK',
  OPPONENT_PEEK: 'OPPONENT_PEEK',
  SWAP_ANY: 'SWAP_ANY',
};

function getPowerForCard(card) {
  if (!card || card.rank == null) return null;
  const r = String(card.rank);
  if (r === '6' || r === '7' || r === '8') return POWER.SELF_PEEK;
  if (r === '9' || r === '10' || r === 'J') return POWER.OPPONENT_PEEK;
  if (r === 'Q') return POWER.SWAP_ANY;
  return null;
}

function makeInitialRoundState() {
  const deck = createShuffledDeck();
  const discardPile = [];
  const take = (n) => deck.splice(0, n);
  const players = {
    1: { hand: take(4), pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerCardId: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
    2: { hand: take(4), pendingCard: null, swappingWithDiscard: false, activePower: null, activePowerToken: null, activePowerCardId: null, activePowerExpiresAt: null, activePowerLabel: null, revealedCardId: null, cardRevealExpiresAt: null },
  };
  discardPile.push(take(1)[0]);
  return {
    deck,
    discardPile,
    players,
    currentPlayer: 1,
    hasStackedThisRound: false,
    swapFirstCard: null,
    swapAnimation: null,
    cactusCalledBy: null,
    roundOver: false,
    finalStackExpiresAt: null,
    finalStackExpired: false,
  };
}

function filterStateFor(room, playerId) {
  const round = room.round;
  if (!round) return null;
  
  // If round is over, don't mask anything - show all cards
  if (round.finalStackExpired) {
    return JSON.parse(JSON.stringify(round));
  }
  
  const maskHand = (hand, revealedCardId, revealedBy, viewingPlayerId) => hand.map(c => {
    // If this card is revealed AND the viewing player is the one who revealed it, send full data
    if (c.id === revealedCardId && revealedBy === viewingPlayerId) {
      return { ...c };
    }
    return { id: c.id, color: c.color, suit: undefined, rank: undefined };
  });
  const filtered = JSON.parse(JSON.stringify(round));
  // Player sees their own hand fully, opponent's hand masked except revealed cards they revealed
  if (playerId === 1) {
    filtered.players[1] = round.players[1];
    filtered.players[2] = { ...round.players[2], hand: maskHand(round.players[2].hand, round.players[2].revealedCardId, round.players[2].revealedBy, playerId) };
  } else {
    filtered.players[1] = { ...round.players[1], hand: maskHand(round.players[1].hand, round.players[1].revealedCardId, round.players[1].revealedBy, playerId) };
    filtered.players[2] = round.players[2];
  }
  return filtered;
}

function broadcastRoom(room) {
  const s1 = room.socketsByPlayer[1];
  const s2 = room.socketsByPlayer[2];
  if (s1) io.to(s1).emit('round_update', { phase: room.phase, round: filterStateFor(room, 1), match: { currentRound: room.currentRound, totalScores: room.totalScores, settings: room.matchSettings } });
  if (s2) io.to(s2).emit('round_update', { phase: room.phase, round: filterStateFor(room, 2), match: { currentRound: room.currentRound, totalScores: room.totalScores, settings: room.matchSettings } });
}

function getPlayerId(room, socketId) {
  return room.players[socketId]?.playerId || null;
}

function isAnimating(room) {
  return !!room.round?.swapAnimation;
}

function finalOrAnimating(round) {
  return round.roundOver || round.finalStackExpired || !!round.swapAnimation;
}

function endTurn(room) {
  room.round.currentPlayer = room.round.currentPlayer === 1 ? 2 : 1;
}

function clearFinalStackTimer(room) {
  const t = room.timers?.finalStack;
  if (t) {
    clearInterval(t);
    room.timers.finalStack = null;
  }
}

function startFinalStackTimer(room) {
  clearFinalStackTimer(room);
  room.round.finalStackExpiresAt = Date.now() + 10000;
  room.round.finalStackExpired = false;
  room.timers.finalStack = setInterval(() => {
    if (!room.round) return;
    if (Date.now() >= room.round.finalStackExpiresAt) {
      room.round.finalStackExpired = true;
      clearFinalStackTimer(room);
    }
    broadcastRoom(room);
  }, 100);
}

function safeSwap(room, from, to) {
  const pA = room.round.players[from.playerId];
  const pB = room.round.players[to.playerId];
  if (!pA || !pB) return;
  const aIdx = from.cardIndex;
  const bIdx = to.cardIndex;
  if (aIdx < 0 || bIdx < 0) return;
  if (aIdx >= pA.hand.length || bIdx >= pB.hand.length) return;
  const cardA = pA.hand[aIdx];
  const cardB = pB.hand[bIdx];
  if (!cardA || !cardB) return;
  pA.hand[aIdx] = cardB;
  pB.hand[bIdx] = cardA;
  // Clear SWAP_ANY from whoever has it
  [1,2].forEach(pid => {
    const pl = room.round.players[pid];
    if (pl.activePower === POWER.SWAP_ANY) {
      pl.activePower = null;
      pl.activePowerToken = null;
      pl.activePowerCardId = null;
      pl.activePowerExpiresAt = null;
      pl.activePowerLabel = null;
    }
  });
}

function runSwapAnimation(room, from, to) {
  if (!room.round) return;
  const start = Date.now();
  const duration = 360;
  let swapped = false;
  const id = setInterval(() => {
    if (!room.round) { clearInterval(id); return; }
    const now = Date.now();
    const progress = Math.min(1, (now - start) / duration);
    room.round.swapAnimation = { from, to, start, duration, progress };
    if (progress >= 0.5 && !swapped) {
      swapped = true;
      safeSwap(room, from, to);
    }
    if (progress >= 1) {
      clearInterval(id);
      room.round.swapAnimation = null;
      room.round.swapFirstCard = null;
    }
    broadcastRoom(room);
  }, 40);
}

io.on('connection', (socket) => {
  console.log('[SERVER] Socket connected:', socket.id);
  
  socket.on('join_room', ({ roomId }) => {
    console.log('[SERVER] join_room:', socket.id, roomId);
    const room = rooms.ensure(roomId);
    // assign player slot
    let assigned = null;
    if (!room.socketsByPlayer[1]) { room.socketsByPlayer[1] = socket.id; assigned = 1; }
    else if (!room.socketsByPlayer[2]) { room.socketsByPlayer[2] = socket.id; assigned = 2; }
    else { socket.emit('error', { message: 'Room full' }); return; }
    room.players[socket.id] = { playerId: assigned };
    socket.join(roomId);
    if (!room.round) {
      room.round = makeInitialRoundState();
      room.phase = 'playing';
    }
    socket.emit('room_update', { roomId, playerId: assigned });
    broadcastRoom(room);
  });

  socket.on('start_match', ({ roomId, numberOfRounds }) => {
    console.log('[SERVER] start_match:', socket.id, roomId, numberOfRounds);
    const room = rooms.ensure(roomId);
    if (!room.players[socket.id]) return;
    room.matchSettings = { numberOfRounds, numberOfPlayers: 2 };
    room.phase = 'playing';
    room.currentRound = 1;
    room.totalScores = { 1: 0, 2: 0 };
    room.round = makeInitialRoundState();
    broadcastRoom(room);
  });

  socket.on('deal_initial', ({ roomId }) => {
    console.log('[SERVER] deal_initial:', socket.id, roomId);
    const room = rooms.ensure(roomId);
    if (!room.players[socket.id]) return;
    room.round = makeInitialRoundState();
    clearFinalStackTimer(room);
    broadcastRoom(room);
  });

  // --- Turn actions ---
  socket.on('draw_card', ({ roomId }) => {
    console.log('[SERVER] draw_card:', socket.id, roomId);
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid || room.round.currentPlayer !== pid) return;
    const r = room.round;
    if (r.roundOver || r.finalStackExpired) return;
    if (isAnimating(room)) return;
    if (r.players[pid].pendingCard) return;
    if (r.players[pid].swappingWithDiscard) return;
    if (r.deck.length === 0) return;
    const drawn = r.deck.shift();
    r.players[pid].pendingCard = drawn;
    broadcastRoom(room);
  });

  socket.on('discard_pending', ({ roomId }) => {
    console.log('[SERVER] discard_pending:', socket.id, roomId);
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid || room.round.currentPlayer !== pid) return;
    const r = room.round;
    if (isAnimating(room)) return;
    const pending = r.players[pid].pendingCard;
    if (!pending) return;
    r.discardPile.push(pending);
    r.hasStackedThisRound = false;
    // power granting
    const power = getPowerForCard(pending);
    if (power) {
      const token = `${Date.now()}-${Math.random()}`;
      const expiresAt = Date.now() + 10000;
      Object.assign(r.players[pid], { pendingCard: null, activePower: power, activePowerToken: token, activePowerCardId: pending.id, activePowerExpiresAt: expiresAt, activePowerLabel: pending.rank });
      // schedule expiry
      setTimeout(() => {
        const pl = room.round?.players?.[pid];
        if (!pl) return;
        if (pl.activePowerToken !== token) return;
        Object.assign(pl, { activePower: null, activePowerToken: null, activePowerCardId: null, activePowerExpiresAt: null, activePowerLabel: null });
        broadcastRoom(room);
      }, 10000);
    } else {
      r.players[pid].pendingCard = null;
    }
    // End turn, cactus logic
    const callerFinishingTurn = r.cactusCalledBy === pid;
    endTurn(room);
    if (r.cactusCalledBy !== null && !callerFinishingTurn) {
      r.roundOver = true;
      startFinalStackTimer(room);
    }
    broadcastRoom(room);
  });

  socket.on('swap_with_hand', ({ roomId, cardIndex }) => {
    console.log('[SERVER] swap_with_hand:', socket.id, roomId, cardIndex);
    const index = cardIndex;
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid || room.round.currentPlayer !== pid) return;
    const r = room.round;
    if (finalOrAnimating(r)) return;
    const pending = r.players[pid].pendingCard;
    if (!pending) return;
    const hand = r.players[pid].hand;
    if (typeof index !== 'number' || index < 0 || index >= hand.length) return;
    const replaced = hand[index];
    hand[index] = pending;
    r.players[pid].pendingCard = null;
    r.discardPile.push(replaced);
    r.hasStackedThisRound = false;
    const callerFinishingTurn = r.cactusCalledBy === pid;
    endTurn(room);
    if (r.cactusCalledBy !== null && !callerFinishingTurn) {
      r.roundOver = true;
      startFinalStackTimer(room);
    }
    broadcastRoom(room);
  });

  socket.on('swap_with_discard', ({ roomId, cardIndex }) => {
    console.log('[SERVER] swap_with_discard:', socket.id, roomId, cardIndex);
    const index = cardIndex;
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid || room.round.currentPlayer !== pid) return;
    const r = room.round;
    if (finalOrAnimating(r)) return;
    if (r.discardPile.length === 0) return;
    const hand = r.players[pid].hand;
    if (typeof index !== 'number' || index < 0 || index >= hand.length) return;
    const top = r.discardPile[r.discardPile.length - 1];
    const handCard = hand[index];
    hand[index] = top;
    r.discardPile[r.discardPile.length - 1] = handCard;
    r.players[pid].swappingWithDiscard = false;
    r.hasStackedThisRound = false;
    const callerFinishingTurn = r.cactusCalledBy === pid;
    endTurn(room);
    if (r.cactusCalledBy !== null && !callerFinishingTurn) {
      r.roundOver = true;
      startFinalStackTimer(room);
    }
    broadcastRoom(room);
  });

  socket.on('stack', ({ roomId, cardIndex }) => {
    console.log('[SERVER] stack:', socket.id, roomId, cardIndex);
    const index = cardIndex;
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid) return;
    const r = room.round;
    if (r.discardPile.length === 0) return;
    const hand = r.players[pid].hand;
    if (hand.length <= 1) return; // must keep at least 1 card
    if (typeof index !== 'number' || index < 0 || index >= hand.length) return;
    const top = r.discardPile[r.discardPile.length - 1];
    const handCard = hand[index];
    if (String(handCard.rank) === String(top.rank)) {
      // remove from hand and push to discard; no turn switch
      r.players[pid].hand = hand.filter((_, i) => i !== index);
      r.discardPile.push(handCard);
      r.hasStackedThisRound = true;
    } else {
      // draw up to 2 cards
      for (let i = 0; i < 2 && r.deck.length > 0; i++) {
        hand.push(r.deck.shift());
      }
      r.hasStackedThisRound = false;
    }
    broadcastRoom(room);
  });

  // --- Powers ---
  socket.on('activate_power', ({ roomId, type, targetPlayerId, cardId }) => {
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid) return;
    const r = room.round;
    if (r.finalStackExpired) return;
    // Validate token + expiry before applying
    const activator = r.players[pid];
    if (type === POWER.SELF_PEEK) {
      if (activator.activePower !== POWER.SELF_PEEK || !activator.activePowerToken || !activator.activePowerExpiresAt || Date.now() >= activator.activePowerExpiresAt) return;
      activator.revealedCardId = cardId;
      activator.revealedBy = pid;
      activator.cardRevealExpiresAt = Date.now() + 4000;
      // consume power
      activator.activePower = null;
      activator.activePowerToken = null;
      activator.activePowerExpiresAt = null;
      activator.activePowerLabel = null;
      setTimeout(() => {
        const pl = room.round?.players?.[pid];
        if (!pl) return;
        pl.revealedCardId = null;
        pl.revealedBy = null;
        pl.cardRevealExpiresAt = null;
        broadcastRoom(room);
      }, 4000);
    } else if (type === POWER.OPPONENT_PEEK) {
      if (activator.activePower !== POWER.OPPONENT_PEEK || !activator.activePowerToken || !activator.activePowerExpiresAt || Date.now() >= activator.activePowerExpiresAt) return;
      const target = r.players[targetPlayerId];
      if (!target) return;
      target.revealedCardId = cardId;
      target.revealedBy = pid;
      target.cardRevealExpiresAt = Date.now() + 4000;
      activator.activePower = null;
      activator.activePowerToken = null;
      activator.activePowerExpiresAt = null;
      activator.activePowerLabel = null;
      setTimeout(() => {
        const t = room.round?.players?.[targetPlayerId];
        if (!t) return;
        t.revealedCardId = null;
        t.revealedBy = null;
        t.cardRevealExpiresAt = null;
        broadcastRoom(room);
      }, 4000);
    } else if (type === POWER.SWAP_ANY) {
      // Selection flow handled via swap_any_select
      // no-op here to keep protocol simple
    }
    broadcastRoom(room);
  });

  socket.on('close_reveal', ({ roomId, playerId }) => {
    const room = rooms.ensure(roomId);
    const r = room.round;
    if (!r) return;
    const p = r.players[playerId];
    if (!p) return;
    p.revealedCardId = null;
    p.cardRevealExpiresAt = null;
    broadcastRoom(room);
  });

  socket.on('swap_any_select', ({ roomId, playerId, cardIndex, cardId }) => {
    const room = rooms.ensure(roomId);
    const r = room.round;
    if (!r || r.finalStackExpired) return;
    if (isAnimating(room)) return;
    const holder = r.players[1].activePower === POWER.SWAP_ANY ? r.players[1] : r.players[2].activePower === POWER.SWAP_ANY ? r.players[2] : null;
    if (!holder || !holder.activePowerToken || !holder.activePowerExpiresAt || Date.now() >= holder.activePowerExpiresAt) return;
    if (!r.swapFirstCard) {
      r.swapFirstCard = { playerId, cardIndex, cardId };
      broadcastRoom(room);
      return;
    }
    // same card -> cancel
    if (r.swapFirstCard.playerId === playerId && r.swapFirstCard.cardIndex === cardIndex) {
      r.swapFirstCard = null;
      broadcastRoom(room);
      return;
    }
    // start animation
    const from = r.swapFirstCard;
    const to = { playerId, cardIndex, cardId };
    runSwapAnimation(room, from, to);
  });

  // Cactus / round end
  socket.on('call_cactus', ({ roomId }) => {
    console.log('[SERVER] call_cactus:', socket.id, roomId);
    const room = rooms.ensure(roomId);
    const pid = getPlayerId(room, socket.id);
    if (!pid) return;
    const r = room.round;
    if (r.roundOver) return;
    r.cactusCalledBy = pid;
    broadcastRoom(room);
  });

  socket.on('reset_round', ({ roomId }) => {
    console.log('[SERVER] reset_round:', socket.id, roomId);
    const room = rooms.ensure(roomId);
    if (!room.players[socket.id]) return;
    room.round = makeInitialRoundState();
    clearFinalStackTimer(room);
    broadcastRoom(room);
  });

  socket.on('disconnect', () => {
    // remove player socket mapping but keep room state so reconnects don't reset deck
    for (const [roomId, room] of rooms.rooms) {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        const pid = room.socketsByPlayer[1] === socket.id ? 1 : room.socketsByPlayer[2] === socket.id ? 2 : null;
        if (pid) room.socketsByPlayer[pid] = null;
        // keep room data intact; do not delete room
      }
    }
  });
});

const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, () => {
  console.log(`Cactus server listening on :${PORT}`);
});
