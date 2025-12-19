# Match Setup Flow - Architecture Documentation

## Overview
This implementation introduces a multi-round match system with a clean separation between match-level orchestration and round-level gameplay. The architecture is future-proof for adding more players (3-8) and additional settings.

## File Structure

```
cactus-client/src/
├── pages/
│   ├── Match.jsx          # NEW: Match orchestrator (setup → play → over)
│   └── Game.jsx           # MODIFIED: Single round gameplay (now accepts props)
├── components/
│   ├── MatchSetup.jsx     # NEW: Configuration screen
│   └── MatchOver.jsx      # NEW: Final results screen
└── App.jsx                # MODIFIED: Routes to Match instead of Game
```

## Component Responsibilities

### Match.jsx (Match Controller)
**Purpose**: Orchestrates the entire match lifecycle

**State Management**:
- `matchPhase`: "setup" | "playing" | "over"
- `matchSettings`: { numberOfRounds, numberOfPlayers }
- `currentRound`: Current round number (1-indexed)
- `totalScores`: Accumulated scores { 1: score, 2: score }

**Flow**:
1. **Setup Phase**: Renders `<MatchSetup />` to collect settings
2. **Playing Phase**: Renders `<Game />` with match context props
3. **Over Phase**: Renders `<MatchOver />` with final results

**Key Methods**:
- `handleStartMatch(settings)`: Initialize match with user settings
- `handleRoundComplete(roundScores)`: Accumulate scores and advance round
- `handleRestart()`: Return to setup screen

### Game.jsx (Round Controller)
**Purpose**: Handles single round gameplay logic

**New Props** (all optional for backwards compatibility):
- `numberOfPlayers`: Number of players (default: 2)
- `currentRound`: Current round number (default: 1)
- `totalRounds`: Total rounds in match (default: 1)
- `totalScores`: Running total scores (default: {})
- `onRoundComplete`: Callback when round ends (default: null)

**Key Changes**:
- Displays match info (round X of Y, total scores) when in match mode
- `handleResetDeck()` now:
  - In match mode: calls `onRoundComplete(roundScores)` to report scores
  - In standalone mode: resets for another round (existing behavior)
- Button text changes based on context:
  - Standalone: "Reset"
  - Match mode: "Next Round" or "Finish Match"

**Backwards Compatibility**:
- Can still be used standalone without props
- All match-related features are opt-in via props

### MatchSetup.jsx
**Purpose**: Configuration UI for match settings

**Features**:
- Number of rounds: Quick select (3/5/7) or custom input (1-99)
- Number of players: Currently 2, with placeholder for 3-8
- Clean, centered card-style UI with game theme

**Output**: Calls `onStartMatch({ numberOfRounds, numberOfPlayers })`

### MatchOver.jsx
**Purpose**: Final match results display

**Features**:
- Shows all player scores sorted by rank
- Highlights winner (lowest score in Cactus)
- Handles tie scenarios
- "New Match" button returns to setup

**Props**:
- `totalScores`: Final accumulated scores
- `numberOfPlayers`: Number of players in match
- `onRestart`: Callback to return to setup

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Match.jsx                            │
│  (Match-level state: settings, round counter, total scores) │
└─────────────────────────────────────────────────────────────┘
                │                    ▲
                │ Props              │ Callback
                ▼                    │
┌─────────────────────────────────────────────────────────────┐
│                         Game.jsx                             │
│      (Round-level state: deck, hands, turns, powers)        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Downward (Props)**:
- Match settings (numberOfPlayers, currentRound, totalRounds)
- Total scores for display
- Callback reference (onRoundComplete)

**Upward (Callbacks)**:
- Round completion signal with scores: `onRoundComplete({ 1: 15, 2: 23 })`

## Score Accumulation

### Round Scores
Calculated in Game.jsx when `finalStackExpired === true`:
```javascript
const player1Score = calculateHandScore(players[1].hand);
const player2Score = calculateHandScore(players[2].hand);
```

### Total Scores
Accumulated in Match.jsx:
```javascript
handleRoundComplete(roundScores) {
  setTotalScores(prevTotals => {
    const newTotals = { ...prevTotals };
    Object.keys(roundScores).forEach(playerId => {
      newTotals[playerId] = (newTotals[playerId] || 0) + roundScores[playerId];
    });
    return newTotals;
  });
  
  // Check if match is complete
  if (currentRound >= matchSettings.numberOfRounds) {
    setMatchPhase("over");
  } else {
    setCurrentRound(prev => prev + 1);
  }
}
```

## Round Progression

1. User starts match with settings
2. Round 1 begins (Game.jsx renders)
3. Round plays until `finalStackExpired === true`
4. User clicks "Next Round" button
5. `handleResetDeck()` calls `onRoundComplete(roundScores)`
6. Match.jsx:
   - Adds scores to `totalScores`
   - Increments `currentRound`
   - Re-renders Game.jsx with new props
7. Game.jsx sees new props, maintains its own fresh state
8. Repeat until `currentRound >= totalRounds`
9. Match.jsx switches to "over" phase

## Future-Proofing

### Adding More Players (3-8)
**What needs to change**:
1. MatchSetup.jsx: Enable 3-8 player buttons
2. Game.jsx: Extend player state initialization
3. Game.jsx: Update turn rotation logic
4. Game.jsx: Update UI layout for more player areas
5. MatchOver.jsx: Already handles N players

**What stays the same**:
- Match.jsx orchestration logic
- Score accumulation algorithm
- Round progression flow

### Adding Rule Toggles
**Recommended approach**:
1. Add toggle UI to MatchSetup.jsx (e.g., "Enable Powers", "Fast Mode")
2. Include toggles in `matchSettings` object
3. Pass settings to Game.jsx as props
4. Game.jsx conditionally enables/disables features

**Example**:
```javascript
// In MatchSetup.jsx
const [enablePowers, setEnablePowers] = useState(true);

onStartMatch({
  numberOfRounds,
  numberOfPlayers,
  enablePowers, // New setting
});

// In Game.jsx
function Game({ enablePowers = true, ... }) {
  // Conditionally render power buttons
  {enablePowers && <PowerButton ... />}
}
```

## Design Decisions

### Why Match.jsx wraps Game.jsx (not the other way around)?
- **Single Responsibility**: Game.jsx focuses on round logic
- **Reusability**: Game.jsx can be used standalone or in a match
- **Testability**: Easy to test round logic independently
- **Scalability**: Can add tournament mode by wrapping Match.jsx

### Why callback-based instead of context?
- **Simplicity**: Only one-level nesting (Match → Game)
- **Explicit**: Data flow is clear and traceable
- **Performance**: No unnecessary re-renders
- **Scope**: Match state doesn't need to be global

### Why not use React Router for phases?
- **Complexity**: Don't need URL-based navigation yet
- **State**: Match state would need to persist across routes
- **UX**: Smoother transitions without URL changes
- **Future**: Can add routes later if needed (e.g., /match/:id)

### Why separate MatchSetup and MatchOver?
- **Clarity**: Each screen has distinct purpose
- **Styling**: Different layout needs (form vs results)
- **Future**: Can add more options/features independently

## Testing the Implementation

### Test Scenarios
1. **Single Round Match**: Select 1 round, play to completion
2. **Multi-Round Match**: Select 3/5/7 rounds, verify score accumulation
3. **Custom Rounds**: Enter custom number (e.g., 10), verify it works
4. **Restart Flow**: Complete match, click "New Match", verify reset
5. **Standalone Mode**: Use Game.jsx directly (should still work)

### Expected Behavior
- Match info shows at top of game when totalRounds > 1
- Button text changes: "Reset" → "Next Round" → "Finish Match"
- Scores accumulate correctly across rounds
- Winner is player with lowest total score
- Ties are handled gracefully

## Implementation Notes

### No Breaking Changes
- Game.jsx still works standalone (all props are optional)
- Existing game logic untouched
- All new code is additive

### State Isolation
- Match state and round state are completely separate
- No shared state between Match and Game
- Clean reset between rounds (Game re-mounts with fresh state)

### Performance Considerations
- Minimal re-renders (state scoped appropriately)
- No expensive computations in render
- Callback memoization not needed (props change infrequently)

## Next Steps (Future Enhancements)

1. **Persistence**: Save match progress to localStorage
2. **History**: Track scores for each round (not just totals)
3. **Statistics**: Show winner of each round, streak tracking
4. **Animations**: Smooth transitions between phases
5. **Multi-player**: Extend to 3-8 players
6. **Rule Variants**: Add optional rules as toggles
7. **Tournaments**: Multiple matches with bracket system
8. **Backend**: Save matches to server, multiplayer support

## Summary

This architecture provides:
- ✅ Clean separation of concerns (match vs round)
- ✅ Future-proof for 2-8 players
- ✅ Easy to add rule toggles
- ✅ No breaking changes to existing code
- ✅ Simple, maintainable state management
- ✅ Clear data flow (props down, callbacks up)
- ✅ Excellent developer experience
