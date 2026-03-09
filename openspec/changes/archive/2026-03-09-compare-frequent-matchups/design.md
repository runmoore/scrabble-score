## Context

The compare player-selection page (`/games/compare`) currently loads only the player list via `getAllPlayers` and renders two dropdowns. To show frequent matchup cards, the loader needs game data to compute which player pairs have played together most often.

The comparison detail page (`compare.$playerOne.$playerTwo.tsx`) already uses `getAllGames` to load all games and filter in-memory for 2-player matchups. This change applies the same pattern to the selection page, but aggregates across all pairs instead of filtering to a specific one.

## Goals / Non-Goals

**Goals:**

- Add matchup computation to the compare selection page loader
- Render up to 3 stacked matchup cards above the existing dropdowns
- Keep the query efficient (single `getAllGames` call, in-memory aggregation)

**Non-Goals:**

- Changing the comparison detail page
- Adding a dedicated database query or denormalized matchup count table
- Infinite scroll or "show more" for additional matchups beyond 3

## Decisions

### 1. Reuse `getAllGames` for matchup computation

**Choice**: Call `getAllGames({ userId })` in the compare selection loader and aggregate pairs in-memory.

**Alternatives considered**:

- **Raw SQL / Prisma groupBy**: Would be more efficient at scale, but adds query complexity. The app is personal-use (single user's games), so the dataset is small.
- **New dedicated query**: Over-engineering for the current need. `getAllGames` already returns players and gameType data.

**Rationale**: Consistent with the pattern established in the comparison detail page loader. The data needed (players, gameType, completed status) is already in the `getAllGames` select. In-memory aggregation on a personal-use dataset is negligible cost.

### 2. Matchup aggregation algorithm

Build a map keyed by a canonical pair key (sorted player IDs joined, e.g. `id1:id2`) to avoid counting "A vs B" and "B vs A" as separate pairs. For each 2-player completed game, increment the pair's game count and collect its game type name (if any) into a Set.

Return the top 3 pairs sorted by game count descending, each with: both player IDs and names, game count, and sorted unique game type names.

### 3. Reuse shared `Card` component with `asLink`

**Choice**: Each matchup card uses the existing `app/components/Card.tsx` component with `asLink={true}` and `to={`/games/compare/${p1Id}/${p2Id}`}`. The `title` prop carries the "PlayerA vs PlayerB" text; `children` renders the game count and game types.

**Rationale**: The `Card` component already handles link rendering, consistent styling (shadow, border, dark mode), and hover effects. No reason to duplicate that. The existing dropdown flow uses a form POST + redirect, but the cards have a known destination — direct linking is simpler and avoids a round-trip.

### 4. Loader return shape

Extend the loader to return `{ players, matchups }` instead of just the players array. The `matchups` type:

```typescript
type Matchup = {
  playerOne: { id: string; name: string };
  playerTwo: { id: string; name: string };
  gameCount: number;
  gameTypes: string[]; // sorted alphabetically, may be empty
};
```

This is a breaking change to the loader's return type, so the component's `useLoaderData` destructuring must update accordingly.

## Risks / Trade-offs

**[Performance] Loading all games on the selection page** → The selection page previously only loaded the player list. Now it loads all games too. For a personal-use app this is fine. If it became a concern, a dedicated aggregate query could replace the in-memory approach without changing the UI.

**[Data freshness] Matchup counts based on full game list** → Counts include all completed 2-player games. No caching or staleness concern since the loader runs on each request.
