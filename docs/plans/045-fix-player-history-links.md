# Plan: Fix in-progress game links in player history (#45)

## Problem

In `app/routes/games/players.$playerId.tsx`, the game history list links all games to `/games/${game.id}` — including in-progress games. In-progress games should link to the play screen at `/games/${game.id}/play/${nextPlayerId}`.

## Root Cause

The `computeStats()` function's history output doesn't include the next player ID for in-progress games. The `<Link>` component has no data to build the play URL.

## Solution

### 1. Add `nextPlayerId` to history items (computeStats, ~line 145)

For in-progress games, call `getNextPlayerToPlay()` to determine who plays next. Add `nextPlayerId` to the history item shape:

```typescript
// In the history map
nextPlayerId: !game.completed
  ? getNextPlayerToPlay({ scores: game.scores, players: game.players }).id
  : null,
```

Import `getNextPlayerToPlay` (already exported from `~/game-utils`).

### 2. Update `<Link>` target (~line 348-350)

Conditionally build the URL:

```tsx
to={
  game.completed
    ? `/games/${game.id}`
    : `/games/${game.id}/play/${game.nextPlayerId}`
}
```

### Files Changed

- `app/routes/games/players.$playerId.tsx` — 2 small edits

### Testing

- Existing unit/e2e tests should pass
- Manual: navigate to player detail, verify in-progress game links go to play screen
