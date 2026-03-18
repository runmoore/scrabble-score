## 1. Extract focused functions from computeStats

- [x] 1.1 Extract `isOutrightWinner(player, allPlayers)` function
- [x] 1.2 Extract `computeAggregateStats(completedGames, playerId)` function
- [x] 1.3 Extract `buildGameHistory(enrichedGames, playerId)` function
- [x] 1.4 Extract `collectAvailableGameTypes(allGames)` function
- [x] 1.5 Refactor `computeStats()` to be a thin orchestrator calling the extracted functions

## 2. Add unit tests for isOutrightWinner

- [x] 2.1 Add test: returns true when player has place 1 and no other player has place 1
- [x] 2.2 Add test: returns false when player has place 1 but another player also has place 1 (tie)
- [x] 2.3 Add test: returns false when player does not have place 1

## 3. Verification

- [x] 3.1 Run `npm run typecheck` — no type errors
- [x] 3.2 Run `npm run lint` — no lint errors
- [x] 3.3 Run `npm test -- --run` — all existing tests pass (regression)
