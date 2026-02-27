## Why

Games created before the game type feature was added (or games where the user skipped selecting a type) have no game type assigned. There is currently no way to retroactively label these games, which means they remain as date-only entries in the games list — harder to identify and excluded from any future game-type-based filtering or analysis. This was explicitly identified as a future enhancement in the original game-typing design.

## What Changes

- Add a server function to set a game type on an existing game that currently has none
- Add game type assignment UI on the game summary page for typeless games, allowing users to pick from existing types or create a new one inline
- Add game type assignment UI on the play screen for typeless games, matching the same pattern
- Games that already have a type continue to show it as read-only (no change to existing behavior)

## Capabilities

### New Capabilities

- `assign-game-type`: Ability to assign a game type to an existing game that has no type, from both the game summary and play screen pages

### Modified Capabilities

## Impact

- **Server models**: New `setGameType()` function in `game.server.ts`
- **Routes**: `games/$gameId.tsx` (summary page — add assignment UI + action), `games/$gameId.play.$playerId.tsx` (play screen — add assignment UI + action)
- **Tests**: Unit tests for the new server function, e2e tests for assigning game type from both pages
