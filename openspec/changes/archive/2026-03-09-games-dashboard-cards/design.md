## Context

The `/games` index page currently renders a plain `<ol>` list of in-progress games, each showing only a relative timestamp ("2 days ago") as a link. The parent layout route (`games.tsx`) already loads all games via `getAllGames()`, which includes players, scores, game type, and completion status — so significant data is already available but unused by the index page.

The compare page (`compare.$playerOne.$playerTwo.tsx`) and matchup cards (`compare.tsx`) already establish a card-based dashboard pattern using the shared `Card` component. The game summary page (`$gameId.tsx`) has an inline leaderboard (place + name + score columns) that is not extracted as a reusable component.

## Goals / Non-Goals

**Goals:**

- Transform the games index into an information-dense dashboard with cards
- Reuse the existing `Card` component for consistent styling
- Extract the leaderboard display into a shared component usable on both the game summary page and the dashboard
- Keep the data layer efficient — avoid N+1 queries or redundant fetches

**Non-Goals:**

- Redesigning the sidebar/layout (parent `games.tsx` route is unchanged)
- Adding new database fields or schema migrations
- Pagination or infinite scroll for games
- Filtering or search on the dashboard

## Decisions

### 1. Data sourcing: reuse parent loader vs. add index loader

**Decision**: Add a dedicated loader to the index route for the last completed game and completed count, while continuing to use `useRouteLoaderData` for the in-progress games list.

**Why**: The parent loader (`games.tsx`) fetches all games with players and scores, which is enough to derive in-progress games, completed count, and even identify the last completed game. However, computing `totalScore` per player requires iterating scores — this logic currently lives in `getGame()`. Rather than duplicating that computation in the index route, we'll add a lightweight server function (`getLastCompletedGame`) that returns a single enhanced game with computed totals, and derive `completedGameCount` from the parent's data.

**Alternative considered**: Doing all computation client-side from the parent loader data. Rejected because computing totalScores for every game on the client is wasteful and the parent loader doesn't return `PlayerWithScores` with totals — just raw scores.

### 2. Leaderboard component extraction

**Decision**: Extract the leaderboard (place/name/score columns at `$gameId.tsx` lines 186-203) into `app/components/Leaderboard.tsx`. The game summary page will import and use this component with no behavior change.

**Why**: The leaderboard display is a self-contained UI pattern (ordinal place, player name, total score) that both the game summary and dashboard need. Extracting it avoids duplication and keeps both views consistent.

**Props interface**:

```typescript
interface LeaderboardPlayer {
  id: string;
  name: string;
  totalScore: number;
  place: number;
}

interface LeaderboardProps {
  players: LeaderboardPlayer[];
}
```

### 3. Dashboard layout structure

**Decision**: Use a grid layout matching the compare page pattern (`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`).

Card order:

1. **In-progress game cards** (one per game, accent style, linking to play screen) — show player names, game type, time ago, current scores per player
2. **Completed games count card** — simple stat card showing total count
3. **Last completed game card** — shows game type, date, and the shared Leaderboard component

**Why**: Mirrors the compare page's card grid. In-progress games come first because they're actionable — the user likely opened the app to continue a game. The summary cards provide at-a-glance context without dominating.

**Empty states**: When no in-progress games exist, only the summary cards show. When no completed games exist, only the in-progress cards and a "No completed games yet" placeholder show.

### 4. New server function

**Decision**: Add `getLastCompletedGame({ userId })` to `game.server.ts` that returns the most recently created completed game with enhanced player data (totalScore, sorted by score, with place).

**Why**: Reuses the same score-totalling pattern as `getGame()` but queries for a specific game (last completed). This keeps the computation server-side and returns a ready-to-render structure.

The completed count can be derived from the parent loader's `games` array with a simple filter — no additional query needed.

## Risks / Trade-offs

- **Parent loader already fetches all games**: We're adding one more query (`getLastCompletedGame`) on the index route. This is a single `findFirst` with `orderBy` — negligible cost. → Acceptable trade-off for clean separation.
- **Leaderboard extraction is a refactor**: Changing `$gameId.tsx` to use the extracted component could introduce regressions. → Mitigated by keeping identical markup and existing tests.
- **Mobile card density**: Multiple cards on a single-column mobile layout could push content below the fold. → In-progress games are most important and render first; summary cards follow naturally.
