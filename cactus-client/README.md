# Cactus Client (React + Vite)

This is the Vite + React client for the cactus card game.

## Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: build the production bundle
- `npm run preview`: preview the production build

## Socket.IO (Thin Client Connector)

A minimal Socket.IO client is available to exercise the server events without changing the UI. It is gated by an environment flag.

### Enable connector

Run the client with env variables:

```
VITE_USE_SOCKET=true VITE_SERVER_URL=http://localhost:5050 npm run dev
```

Optional query params control the room and player name:

- `?room=<room-id>`
- `&name=<your-name>`

Example: `http://localhost:5173/?room=dev-room&name=Alice`

### Methods

The connector singleton is exposed during connection at `window.cactusNet` for quick manual testing in the browser console. Common emits:

- `joinRoom(roomId, playerName)`
- `startMatch(payload)`
- `dealInitial(payload)`
- `drawCard(payload)`
- `discardPending(payload)`
- `swapWithHand(payload)`
- `swapWithDiscard(payload)`
- `stack(payload)`
- `activatePower(payload)`
- `closeReveal(payload)`
- `swapAnySelect(payload)`
- `callCactus(payload)`
- `resetRound(payload)`

All incoming events are logged to the console via `onAny` for visibility.
