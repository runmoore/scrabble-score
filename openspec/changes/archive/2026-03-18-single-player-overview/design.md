## Context

The app tracks multiplayer games across different game types. The compare page (`/games/compare`) provides head-to-head stats between two players, but there's no way to view a single player's performance across all their games. The dashboard shows the top 3 most active players but doesn't link to any detail view.

Existing patterns to follow: the compare page already implements game type pill toggle filtering via `useSearchParams` + `?type=` param, score enrichment via `enrichPlayerScores`/`assignPlaces` from `game-utils.ts`, and scrollable game history lists.

## Goals / Non-Goals

**Goals:**

- Single player career overview with stats computed from completed games only
- Game type filtering that adjusts all stats and history
- Per-game-type breakdowns for average score and highest score when viewing "All" (avoids mixing incompatible score scales)
- Full game history including in-progress games for visibility
- Navigation integration via sidebar and dashboard link

**Non-Goals:**

- Player editing or management (name changes, merging, deletion)
- Comparison between more than two players
- Historical trends or charts (just aggregate stats)
- Game type management from the player pages

## Decisions

**Loader pattern**: Parallel fetch of player + all player games, then compute stats in the loader. Keeps the component simple and follows the existing compare page pattern.

_Rationale_: Server-side computation is consistent with the app's progressive enhancement approach. Stats are derived from the full game list, so a single query is sufficient.

**Stats per game type when "All" selected**: Average score and highest score display per-game-type breakdowns rather than a single aggregate number.

_Rationale_: Mixing Scrabble scores (~300) with Sushi Go scores (~40) produces a meaningless average. The compare page doesn't face this issue because it always shows individual game rows.

**Win rate calculation**: Wins / completed games, where a "win" requires `place === 1` AND being the only player with `place === 1`. Ties count as neither win nor loss.

_Rationale_: Uses `assignPlaces()` from `game-utils.ts` which already handles tie ranking correctly. Counting ties as non-wins avoids inflating win rates.

**Games without a game type**: Included in overall stats when "All" is selected but skipped in per-game-type breakdowns. No pill toggle shown for untyped games.

_Rationale_: Untyped games are legacy data — they should contribute to totals but don't form a meaningful category for filtering.

**Player list sorting**: By completed game count descending, alphabetical tiebreaker.

_Rationale_: Shows most active players first, matching the dashboard's "Most Active Players" ordering.

## Risks / Trade-offs

- [All games loaded at once] → Acceptable for expected data volumes (dozens to low hundreds of games per player). No pagination needed.
- [Stats computed on every request] → No caching needed given SQLite performance and data volume. Can add if needed later.
- [Game history includes in-progress games but stats exclude them] → Clear UX with "In Progress" badge differentiating from completed games.
