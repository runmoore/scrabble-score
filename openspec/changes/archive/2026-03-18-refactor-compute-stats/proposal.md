## Why

`computeStats()` in the player detail page is ~150 lines with three distinct responsibilities mixed together. Splitting it into focused functions improves testability of individual pieces and readability.

## What Changes

- Extract four focused functions from `computeStats()`: `isOutrightWinner`, `computeAggregateStats`, `buildGameHistory`, `collectAvailableGameTypes`
- `computeStats()` becomes a thin orchestrator calling these functions
- Add direct unit tests for `isOutrightWinner` (encapsulates a non-obvious business rule)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — pure refactor, no requirement-level behavior changes)_

## Impact

- Modified: `app/routes/games/players.$playerId.tsx` (extract functions, slim down `computeStats()`)
- Modified: `app/routes/games/players.$playerId.test.tsx` (add `isOutrightWinner` unit tests)
- No API, database, or dependency changes
- Pure refactor — no behavioral change
