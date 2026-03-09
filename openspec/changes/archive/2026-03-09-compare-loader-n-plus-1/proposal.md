## Why

The compare page loader has a classic N+1 query problem. It fetches all games with `getAllGames`, then calls `getGame` individually for each relevant game just to get the computed `totalScore` field. For two players sharing 50 games, that's 51 database queries instead of 1.

## What Changes

- Remove the per-game `getGame` calls from the compare page loader
- Compute `totalScore` inline from the scores data already returned by `getAllGames`
- No change to the loader's output shape — downstream components are unaffected

## Capabilities

### New Capabilities

_None — this is a pure performance optimization with no new capabilities._

### Modified Capabilities

_None — the compare page's requirements and behavior are unchanged. This is an implementation-only change (N+1 → single query) with no spec-level impact._

## Impact

- **Code**: `app/routes/games/compare.$playerOne.$playerTwo.tsx` loader function
- **Performance**: Eliminates N parallel DB queries per compare page load, replaced by in-memory score computation
- **APIs**: No changes — `getGame` remains available for other routes
- **Risk**: Low — the `totalScore` computation is a simple `reduce` over data already present
