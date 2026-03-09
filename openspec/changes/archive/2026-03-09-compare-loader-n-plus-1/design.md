## Context

The compare page loader (`compare.$playerOne.$playerTwo.tsx`) fetches all user games via `getAllGames`, filters to 2-player games containing both players, then calls `getGame` individually for each match. The sole reason for the per-game `getGame` calls is to obtain `totalScore` — a computed field that sums a player's score entries. `getAllGames` already returns the raw `scores` array per game, so the data needed for this computation is already in memory.

## Goals / Non-Goals

**Goals:**

- Eliminate the N+1 query pattern by computing `totalScore` inline from data already returned by `getAllGames`
- Preserve the exact loader return shape (`EnhancedGame[]` with `PlayerWithScores`) so no downstream component changes are needed

**Non-Goals:**

- Refactoring `getGame` or `getAllGames` — both remain unchanged for other consumers
- Changing the compare page UI or statistics logic
- Optimizing the `getAllGames` query itself (it fetches all user games regardless of player filter — that's a separate concern)

## Decisions

### Inline `totalScore` computation instead of extracting a shared helper

**Decision**: Compute `totalScore` directly in the loader's `.map()` chain rather than extracting a reusable utility.

**Rationale**: The two call sites (`getGame` and the compare loader) operate on different input shapes — `getGame` works with a Prisma query result fetched by ID, while the compare loader works with the `getAllGames` return type where players are plain `Player[]` without scores attached. Extracting a shared helper would need to abstract over these differing shapes, adding complexity for exactly 2 call sites that are unlikely to diverge. If a third consumer appears, we can extract then.

### Omit `place` field from compare loader output

**Decision**: The inline computation omits the `place` field entirely rather than matching the full `EnhancedGame` / `PlayerWithScores` shape.

**Rationale**: The compare page never reads `place` — it only uses `totalScore` and `name`. Since the loader's return type is inferred (not explicitly annotated as `EnhancedGame[]`), omitting `place` doesn't cause type errors. Computing `place` here would also require tie-aware logic to maintain consistency with other routes (e.g., `$gameId.tsx`), which is unnecessary complexity for a field that's never consumed.

## Risks / Trade-offs

- **Subtle type mismatch** → Mitigated by ensuring the mapped object includes all fields from `EnhancedGame` / `PlayerWithScores`. TypeScript will catch missing fields at build time.
- **Divergent `totalScore` logic** → The inline computation must match `getGame`'s existing logic (`scores.filter(s => s.playerId === player.id).reduce((sum, s) => sum + s.points, 0)`). Since both are trivial sums, divergence risk is minimal, but a unit test should verify parity.
