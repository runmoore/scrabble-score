---
title: "Refactor computeStats() into focused single-responsibility functions"
category: code-quality
date: 2026-03-18
tags: [refactoring, single-responsibility, performance, testability]
component: player-stats
severity: low
resolution_time: quick
problem_summary: "Monolithic 150-line computeStats() function mixed data enrichment, stat aggregation, and history building"
solution_summary: "Split into 4 focused functions and optimized aggregation from triple-pass to single-pass iteration"
file_modified: "app/routes/games/players.$playerId.tsx"
test_coverage: "125 tests passing"
---

## Problem

`computeStats()` in `app/routes/games/players.$playerId.tsx` was ~150 lines with three mixed responsibilities: enriching game data, computing aggregate statistics, and building the game history list. The win-condition check (`thisPlayer.place === 1 && playersWithPlace1.length === 1`) was duplicated in two places, and the function iterated over completed games three separate times with repeated `game.players.find()` lookups.

Identified during code review of PR #41.

## Solution

### Root Cause

Single function accumulating responsibilities over time during feature development. Each piece (overall wins, per-type breakdowns, single-type stats) was added incrementally, resulting in separate loops that could have shared a single pass.

### Steps Applied

**Commit 1 - Extract focused functions:**

- **`isOutrightWinner(player, allPlayers)`** - Encapsulates the win-condition (sole first place, not tied), eliminating duplication
- **`collectAvailableGameTypes(allGames)`** - Derives sorted unique game types
- **`computeAggregateStats(completedGames, playerId, selectedTypeId)`** - All aggregate statistics
- **`buildGameHistory(enrichedGames, playerId)`** - Maps games to display format
- **`computeStats()`** becomes a thin orchestrator

**Commit 2 - Single-pass optimization:**

Consolidated `computeAggregateStats` from triple iteration to single-pass using a `TypeAccumulator` map. Each game is visited once; wins, scores, and per-type breakdowns are accumulated simultaneously.

### Key Code Pattern

Type override with `Omit<...> &` intersection:

```typescript
type EnrichedGame = Omit<
  Awaited<ReturnType<typeof getPlayerGames>>[number],
  "players"
> & {
  players: ReturnType<typeof assignPlaces>;
};
```

Using intersection alone (`Base & { players: NewType }`) creates an impossible type when the base already has a `players` field. `Omit` removes the conflicting field first, then `&` adds the new version.

## Prevention

- **Flag functions exceeding 80-100 lines** in code review, especially with repeated iteration over the same collection or duplicated conditional logic.
- **Name non-obvious business rules as helpers**: Extract conditionals like `isOutrightWinner()` as named functions. Makes intent explicit and prevents duplication.
- **Single-pass accumulation pattern**: Replace multiple iterations with one pass using Map for grouping. Question "why three loops?" — often they're artifacts from incremental development.
- **Extract then name**: Prioritize descriptive function names (`isOutrightWinner`) over anonymous callbacks. Readable names surface reuse opportunities.

## Related

### Documentation

- [player-overview-code-review-findings.md](./player-overview-code-review-findings.md) - Code review findings for PR #41 that identified this refactoring opportunity (among five issues)
- [042-refactor-compute-stats.md](../../docs/plans/042-refactor-compute-stats.md) - Implementation plan for this refactoring

### Related Code

- `app/routes/games/compare.$playerOne.$playerTwo.tsx` - Similar stats computation pattern in compare page
- `app/game-utils.ts` - Provides `enrichPlayerScores()` and `assignPlaces()` used by `computeStats()`

### Issues & PRs

- [Issue #42](https://github.com/runmoore/scrabble-score/issues/42) - This refactoring
- [PR #46](https://github.com/runmoore/scrabble-score/pull/46) - Implementation PR
- [PR #41](https://github.com/runmoore/scrabble-score/pull/41) - Original feature that introduced `computeStats()`
