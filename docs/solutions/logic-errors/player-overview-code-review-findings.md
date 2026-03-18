---
title: "Player Overview Feature - Code Review Findings"
category: logic-errors
date: 2026-03-18
tags:
  - code-review
  - type-safety
  - edge-cases
  - code-reuse
  - database-queries
modules:
  - app/routes/games/players.$playerId.tsx
  - app/routes/games/players.tsx
  - app/models/game.server.ts
  - app/components/Leaderboard.tsx
severity: medium
pr: "#41"
related_issues:
  - "#42"
  - "#43"
  - "#44"
---

# Player Overview Feature - Code Review Findings

Five code quality issues found during review of PR #41 (Single Player Overview). Three fixed in-PR, three deferred to GitHub issues.

## Problem 1: highestScore initialized to 0

**Symptom:** Player's highest score card wouldn't render if their best game scored 0 or negative (Scrabble rack penalties).

**Root cause:** `let highestScore = 0` with `> highestScore` comparison means 0/negative scores never update the tracking variables. The UI guard `highestScore > 0` compounded the issue.

**Fix:** Initialize to `-Infinity` and guard rendering on `highestScoreGameId` being truthy:

```typescript
// BEFORE
let highestScore = 0;
// ...
if (thisPlayer.totalScore > highestScore) { ... }
// UI: {highestScore > 0 && <Card />}

// AFTER
let highestScore = -Infinity;
// ...
if (thisPlayer.totalScore > highestScore) { ... }
// UI: {highestScoreGameId && <Card />}
```

**Pattern:** For "find maximum" operations, always use `-Infinity` (or `Infinity` for minimum). Track the identifier (gameId) as the source of truth for "was anything found", not the value itself.

## Problem 2: getTopPlayers({ limit: Infinity })

**Symptom:** A "top N" function abused to mean "all items". `Array.slice(0, Infinity)` works by accident in JS.

**Root cause:** No dedicated "all players with count" function existed, so the bounded function was repurposed with an extreme value. If `getTopPlayers` ever used Prisma's `take` parameter, `Infinity` would break.

**Fix:** Created `getAllPlayersWithGameCount()` using Prisma `_count` aggregation (matching the existing `getTopGameTypes` pattern):

```typescript
export async function getAllPlayersWithGameCount({ userId }) {
  const players = await prisma.player.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: { select: { games: { where: { deletedAt: null } } } },
    },
  });
  return players
    .map((p) => ({ playerId: p.id, name: p.name, count: p._count.games }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
```

**Bonus:** More efficient than the original — uses SQL COUNT instead of fetching all game rows into JS.

## Problem 3: Duplicate ordinal formatting

**Symptom:** New `getOrdinal()` written in player detail page when `getNumberWithOrdinal()` already existed in `Leaderboard.tsx` with tests.

**Root cause:** Not searching codebase for existing utilities before writing new code.

**Fix:** Import and reuse the existing function. The Leaderboard version uses `Intl.PluralRules` (more robust than manual suffix logic).

**Prevention:** Before writing any utility, search by concept not name:

```bash
# Search for "ordinal" concept, not exact function name
grep -r "ordinal" app/
```

## Problem 4: `as unknown as string` date cast

**Root cause:** `computeStats` runs server-side where `createdAt` is a `Date`, but the cast pretended it was already a string (which it becomes after JSON serialization).

**Fix:** Explicit conversion: `new Date(game.createdAt).toISOString()`

**Pattern:** Never use `as unknown as T` — it's a sign the types are wrong. Convert explicitly at the boundary.

## Problem 5: Non-null assertion `game.place!`

**Root cause:** `place` on `PlayerWithScores` is optional (`place?: number`). Even for completed games, `thisPlayer?.place ?? null` can resolve to `null`. The `!` silenced TypeScript and deferred the crash to runtime.

**Fix:** `{game.place != null ? getNumberWithOrdinal(game.place) : "—"}`

**Pattern:** Treat `!` as a code smell. Always handle the null case explicitly.

## Prevention Checklist

For future code reviews on this codebase:

- [ ] Max/min tracking uses `-Infinity`/`Infinity`, not `0`?
- [ ] No `Infinity` or extreme values passed to bounded functions?
- [ ] Utility functions searched in `app/utils/`, `app/components/`, dependencies before reimplementing?
- [ ] No `as unknown as T` casts? Types converted explicitly?
- [ ] No bare `!` non-null assertions without preceding null checks?
- [ ] Function names match caller intent?

## Related

- `docs/compare-loader-n-plus-1.md` — related N+1 query pattern in compare page
- `docs/plans/2026-03-16-001-feat-single-player-overview-plan.md` — feature plan
- Issue #42 — refactor: split computeStats into smaller functions
- Issue #43 — chore: replace `as any` casts in test mocks
- Issue #44 — chore: consider removing explicit GameTypeStats interface
- `app/routes/games/compare.$playerOne.$playerTwo.tsx` — has same `highestScore = 0` pattern (not yet fixed)
