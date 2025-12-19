import { io } from 'socket.io-client';

class SocketConnector {
  constructor() {
    this.url = import.meta.env.VITE_SERVER_URL || 'http://localhost:5050';
    this._socket = null;
    this._connected = false;
  }

  connect() {
    if (this._socket && this._connected) return this._socket;
    if (!this._socket) {
      this._socket = io(this.url, {
        transports: ['websocket'],
        autoConnect: false,
        withCredentials: true,
      });
    }
    if (!this._connected) {
      this._registerBaseEvents();
      this._socket.connect();
    }
    // Expose immediately for console debugging
    if (typeof window !== 'undefined') {
      window.cactusNet = this;
    }
    return this._socket;
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._connected = false;
    }
  }

  _registerBaseEvents() {
    const s = this._socket;
    s.on('connect', () => {
      this._connected = true;
      // eslint-disable-next-line no-console
      console.log('[NET] connected', s.id);
    });
    s.on('disconnect', (reason) => {
      this._connected = false;
      // eslint-disable-next-line no-console
      console.log('[NET] disconnected', reason);
    });
    s.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[NET] connect_error', err?.message || err);
    });
    s.onAny((event, ...args) => {
      // eslint-disable-next-line no-console
      console.log(`[NET] event: ${event}`, ...args);
    });
  }

  on(event, cb) {
    if (!this._socket) return;
    this._socket.on(event, cb);
  }

  off(event, cb) {
    if (!this._socket) return;
    this._socket.off(event, cb);
  }

  // Convenience for debugging
  onAny(cb) {
    if (!this._socket) return;
    this._socket.onAny((ev, ...args) => cb(ev, ...args));
  }

  // --- Protocol emissions ---
  joinRoom(roomId, playerName) {
    this._emit('join_room', { roomId, playerName });
  }
  startMatch(payload = {}) {
    this._emit('start_match', payload);
  }
  dealInitial(payload = {}) {
    this._emit('deal_initial', payload);
  }
  drawCard(payload = {}) {
    this._emit('draw_card', payload);
  }
  discardPending(payload = {}) {
    this._emit('discard_pending', payload);
  }
  swapWithHand(payload) {
    this._emit('swap_with_hand', payload);
  }
  swapWithDiscard(payload) {
    this._emit('swap_with_discard', payload);
  }
  stack(payload = {}) {
    this._emit('stack', payload);
  }
  activatePower(payload) {
    this._emit('activate_power', payload);
  }
  closeReveal(payload) {
    this._emit('close_reveal', payload);
  }
  swapAnySelect(payload) {
    this._emit('swap_any_select', payload);
  }
  callCactus(payload = {}) {
    this._emit('call_cactus', payload);
  }
  resetRound(payload = {}) {
    this._emit('reset_round', payload);
  }

  // Internal send wrapper
  _emit(event, payload) {
    if (!this._socket || !this._connected) {
      // eslint-disable-next-line no-console
      console.warn('[NET] emit before connect', event, payload);
      return;
    }
    this._socket.emit(event, payload);
  }
}

const connector = new SocketConnector();

// Expose globally for console debugging
if (typeof window !== 'undefined') {
  window.cactusNet = connector;
}

export default connector;
