## Context

The `computeStats()` function in `app/routes/games/players.$playerId.tsx` handles game enrichment, stats computation, history building, and game type collection in a single ~150-line function. All behavior is covered by existing loader-level tests, but the function is hard to read and individual pieces can't be tested in isolation.

## Goals / Non-Goals

**Goals:**

- Split `computeStats()` into four focused functions with clear single responsibilities
- Keep all functions in the same file (they're internal to this route)
- Maintain existing behavior exactly — zero functional changes
- Add targeted tests for `isOutrightWinner` which encapsulates a non-obvious business rule

**Non-Goals:**

- Moving functions to shared utility files
- Changing the stats computation logic
- Adding new stats or modifying the UI

## Decisions

**Four extracted functions:**

1. `isOutrightWinner(player, allPlayers)` — Returns true if the player has place 1 and is the only player with place 1 (no tie). Eliminates the duplicated check.
2. `computeAggregateStats(completedGames, playerId)` — Computes wins, winRate, gamesPlayed, and per-type/single-type stats.
3. `buildGameHistory(enrichedGames, playerId)` — Maps enriched games to the flat history objects for display.
4. `collectAvailableGameTypes(allGames)` — Derives sorted list of unique game types from all games.

_Rationale_: Each function has a clear single responsibility. The naming reflects what each does, making `computeStats` readable as an orchestrator.

**Keep in same file**: These functions are specific to the player detail route and don't need to be shared.

_Rationale_: Moving to utils would be premature extraction — they're only used here.

**Test only `isOutrightWinner` directly**: The other functions are already thoroughly tested via loader-level tests.

_Rationale_: `isOutrightWinner` encapsulates a non-obvious tie-breaking rule worth testing in isolation. The others are straightforward data transformations adequately covered by integration tests.

## Risks / Trade-offs

- [Pure refactor] → Existing tests serve as regression tests. If tests pass, behavior is preserved.
