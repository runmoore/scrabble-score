## Context

The games dashboard (`app/routes/games/index.tsx`) currently shows in-progress game cards, a completed games count, and the last completed game. The data model already tracks game-player associations (many-to-many) and optional game types via `GameType`. All the data needed for stats is available — it just needs aggregation queries.

The dashboard loader currently fetches `getLastCompletedGame()` and relies on the parent route (`games.tsx`) for the full games list via `useRouteLoaderData`.

## Goals / Non-Goals

**Goals:**

- Show top 3 most popular game types by game count on the dashboard
- Show top 3 most active players by game count on the dashboard
- Keep queries efficient with database-level aggregation

**Non-Goals:**

- Historical trends or time-filtered stats
- Stats for games without a game type (untyped games are excluded from "most popular")
- Pagination or "see all" for stats beyond top 3

## Decisions

### Query approach: Prisma groupBy

Use `prisma.game.groupBy()` for game type popularity and a player-games count query for player activity. This pushes aggregation to SQLite rather than loading all games into memory.

**Alternative considered**: Deriving stats from `getAllGames()` already loaded in the parent route. Rejected because it would require iterating all games client-side and the parent route doesn't include game type or full player data.

### Loader placement: Index route loader

Add both queries to the `games/index.tsx` loader alongside the existing `getLastCompletedGame` call. Run them in parallel with `Promise.all`.

**Alternative considered**: Adding to the parent `games.tsx` loader. Rejected because these stats are only needed on the index page, not on game detail or play pages.

### Card design: Reuse existing Card component

Use the existing `Card` component with a simple ranked list inside (position, name, count). No new components needed — just inline JSX within the index route.

## Risks / Trade-offs

- [Games without a game type are excluded from "most popular"] → Acceptable since game types are optional. If no games have types, the card shows an empty state message.
- [Player count includes both completed and in-progress games] → This gives a more complete activity picture. Deleted games (soft-deleted with `deletedAt`) should be excluded.
