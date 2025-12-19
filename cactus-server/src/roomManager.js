export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> roomState
  }

  get(roomId) {
    return this.rooms.get(roomId);
  }

  ensure(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, this._createEmptyRoom(roomId));
    }
    return this.rooms.get(roomId);
  }

  delete(roomId) {
    this.rooms.delete(roomId);
  }

  _createEmptyRoom(roomId) {
    return {
      roomId,
      phase: 'setup', // 'setup' | 'playing' | 'over'
      matchSettings: null,
      currentRound: 1,
      totalScores: { 1: 0, 2: 0 },
      players: {}, // socketId -> { playerId }
      socketsByPlayer: { 1: null, 2: null },
      round: null, // round state object
      timers: { finalStack: null },
    };
  }
}
