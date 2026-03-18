## Why

In the player detail page, the game history list links all games to `/games/${game.id}` — including in-progress games. In-progress games should link to the play screen at `/games/${game.id}/play/${nextPlayerId}` so users can continue playing directly.

## What Changes

- Add `nextPlayerId` to history items for in-progress games (using `getNextPlayerToPlay()`)
- Update the `<Link>` target to conditionally build the play URL for in-progress games

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `player-detail`: In-progress game history rows link to the play screen instead of the summary page

## Impact

- Modified: `app/routes/games/players.$playerId.tsx` (2 small edits: add `nextPlayerId` to history, update Link target)
- No new files, database, or dependency changes
