# Plan: Refactor computeStats into smaller focused functions (#42)

## Why

`computeStats()` is ~150 lines with three distinct responsibilities mixed together. Splitting it improves testability of individual pieces and readability.

## Approach

Extract four focused functions from `computeStats()`, keeping them in the same file (they're internal to this route). The existing `computeStats()` becomes a thin orchestrator that calls these functions.

### Functions to extract

1. **`isOutrightWinner(player, allPlayers)`** — Returns true if the player has place 1 and is the only player with place 1 (no tie). Eliminates the duplicated `thisPlayer.place === 1 && playersWithPlace1.length === 1` check.

2. **`computeAggregateStats(completedGames, playerId)`** — Computes wins, winRate, gamesPlayed from completed games. Also computes per-type stats (when showing "All") and single-type stats (averageScore, highestScore) when filtered.

3. **`buildGameHistory(enrichedGames, playerId)`** — Maps enriched games to the flat history objects used for display.

4. **`collectAvailableGameTypes(allGames)`** — Derives the sorted list of unique game types from all games (including in-progress).

### What stays in `computeStats()`

- Game enrichment (lines 30-33: map with `assignPlaces(enrichPlayerScores(...))`)
- Filtering by selectedTypeId
- Orchestration: call the extracted functions and return the combined result

### Testing strategy

- Existing loader-level tests already cover all behavior and will serve as regression tests
- Add direct unit tests for `isOutrightWinner()` since it encapsulates a non-obvious business rule
- The other extracted functions are indirectly but thoroughly tested through the loader tests

### Files changed

- `app/routes/games/players.$playerId.tsx` — Extract functions, slim down `computeStats()`
- `app/routes/games/players.$playerId.test.tsx` — Add `isOutrightWinner` unit tests

### Risks

- Pure refactor, no behavior change. Existing tests will catch any regressions.
