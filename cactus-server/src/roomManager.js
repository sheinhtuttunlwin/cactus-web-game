export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> roomState
    this.lobbies = new Map(); // lobbyCode -> { createdAt, settings, players: { playerId: { playerName, socketId } }, maxPlayers }
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

  // Lobby management
  createLobby(settings) {
    const lobbyCode = this._generateLobbyCode();
    this.lobbies.set(lobbyCode, {
      createdAt: Date.now(),
      settings,
      players: {},
      maxPlayers: settings.numberOfPlayers || 2,
    });
    return lobbyCode;
  }

  getLobby(lobbyCode) {
    return this.lobbies.get(lobbyCode) || null;
  }

  addPlayerToLobby(lobbyCode, playerId, playerName, socketId) {
    const lobby = this.lobbies.get(lobbyCode);
    if (!lobby) return false;
    if (Object.keys(lobby.players).length >= lobby.maxPlayers) return false;
    lobby.players[playerId] = { playerName, socketId };
    return true;
  }

  deleteLobby(lobbyCode) {
    this.lobbies.delete(lobbyCode);
  }

  getLobbyState(lobbyCode) {
    const lobby = this.lobbies.get(lobbyCode);
    if (!lobby) return null;
    return {
      lobbyCode,
      settings: lobby.settings,
      players: Object.values(lobby.players),
      maxPlayers: lobby.maxPlayers,
      isFull: Object.keys(lobby.players).length >= lobby.maxPlayers,
    };
  }

  _generateLobbyCode() {
    // Simple alphanumeric code (e.g., "ABC123")
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
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
