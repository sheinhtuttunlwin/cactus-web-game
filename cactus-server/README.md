# Cactus Server (Authoritative)

Location: `cactus/cactus-server`
Stack: Node.js + Socket.IO (in-memory rooms)

## Run

```bash
npm install
npm start
```

Server runs on `http://localhost:5050` and accepts Socket.IO connections.

## Events

- Client → Server
  - `join_room`: { roomId }
  - `start_match`: { roomId, numberOfRounds }
  - `deal_initial`: { roomId }

- Server → Client
  - `room_update`: { roomId, playerId }
  - `round_update`: { phase, round (filtered), match }
  - `error`: { message }

## Notes
- Server is authoritative; maintains room and round state.
- Hidden info: server sends per-socket filtered hands, masking opponent ranks/suits.
- Two players only per room.
- No database; rooms are in-memory and dissolve on disconnect.

## Next steps
- Implement turn actions: draw, discard, swap, cactus, power timers/expiry.
- Enforce phase transitions + validations on server.
- Broadcast timers via expiresAt timestamps for client rendering.
