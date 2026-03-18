---
title: "feat: Single Player Overview"
type: feat
status: completed
date: 2026-03-16
---

# feat: Single Player Overview

## Overview

Users track multiple players across different game types (Scrabble, Sushi Go, Bananagrams), but there's no single place to see how a player is performing. Players only appear in the context of specific games or head-to-head comparisons. The only player-level data visible today is the "Most Active Players" card on the dashboard (top 3, game count only).

Add a player list page (`/games/players`) and individual player detail page (`/games/players/$playerId`) with career stats, game type filtering via pill toggles, and full game history.

## Proposed Solution

### Two new routes under the games layout

**`/games/players`** (file: `app/routes/games/players.tsx`)

- Lists all players as tappable cards
- Each card shows: player name, completed games count
- Sorted by most completed games (descending), alphabetical tiebreaker
- Uses existing `getTopPlayers` pattern (no limit) — no need to fetch all games
- Entry point: dashboard "Most Active Players" card links here

**`/games/players/$playerId`** (file: `app/routes/games/players.$playerId.tsx`)

- Player name as page header
- Game type pill toggles (same `?type=` search param pattern as compare page)
- Career stats cards (completed games only)
- Full game history list

### Navigation

Routes live under `app/routes/games/` so they inherit the games layout sidebar from `app/routes/games.tsx`. Add a "Players" `NavLink` to the `GamesMenu` component alongside the existing "Compare Players" link. This solves back-navigation — the sidebar provides persistent navigation on all screen sizes.

The dashboard "Most Active Players" card title becomes a link to `/games/players`.

## Technical Considerations

### Game Type Pill Toggles

Follow the exact pattern from `compare.$playerOne.$playerTwo.tsx`:

- `useSearchParams()` in component, `url.searchParams.get("type")` in loader
- Derive `availableGameTypes` from unfiltered games, then filter by selection
- Toggleable (click selected pill to deselect back to "All")
- Use same inline `<button>` styling, not the `PillToggle` form component

### Stats Cards (completed games only, filtered by selected game type)

| Stat          | "All" (no filter)                                              | Filtered by game type          |
| ------------- | -------------------------------------------------------------- | ------------------------------ |
| Games Played  | Total completed count                                          | Count for that type            |
| Win Rate      | Overall win rate                                               | Win rate for that type         |
| Average Score | **Per game type breakdown** (one line per type)                | Single average number          |
| Highest Score | **Per game type breakdown** (one line per type, links to game) | Single highest (links to game) |

**Win rate calculation:** Wins / completed games. A "win" = player has `place === 1` AND is the only player with `place === 1` (ties count as neither win nor loss). Use `assignPlaces()` from `game-utils.ts` which already handles tie ranking.

**Average score:** Mean of the player's `totalScore` across completed games. Displayed per game type when unfiltered to avoid mixing Scrabble (~300) and Sushi Go (~40) scales.

### Games Without a Game Type

Games with `gameTypeId: null` are included in overall stats when "All" is selected but skipped in per-game-type breakdowns. They appear in the game history with no type label. No pill toggle is shown for untyped games.

### Game History List

- Shows **all games** (completed + in-progress) for full visibility
- Newest first, scrollable with `max-h-96 overflow-y-auto` (matching compare page)
- Each row: date, game type, player's score, placement (e.g. "1st of 3"), win/loss/draw/in-progress indicator
- In-progress games show an "In Progress" badge instead of placement
- Each row links to `/games/${game.id}`
- Alternating row backgrounds (matching compare page pattern)
- **Stats exclude in-progress games** — only the history list includes them

### New Model Query

Add `getPlayerGames()` to `app/models/game.server.ts`:

```typescript
// app/models/game.server.ts
export function getPlayerGames({
  playerId,
  userId,
}: {
  playerId: string;
  userId: string;
}) {
  return prisma.game.findMany({
    where: {
      userId,
      deletedAt: null,
      players: { some: { id: playerId } },
    },
    select: {
      id: true,
      players: true,
      createdAt: true,
      completed: true,
      scores: true,
      gameType: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
```

Expand `getPlayer({ id, userId })` to also select `id` (needed for stats computation against enriched scores).

### Empty States

- **`/games/players` with no players:** "No players yet. Create a game to add players."
- **`/games/players/$playerId` with 0 completed games:** Stats section shows "No completed games yet" with a neutral message. If in-progress games exist, the history list still shows them.
- **Player not found / wrong user:** Return 404 response (matching existing `getGame` auth pattern).

### Loader Pattern

```typescript
// app/routes/games/players.$playerId.tsx
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.playerId, "playerId not found");
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const selectedTypeId = url.searchParams.get("type");

  const [player, allGames] = await Promise.all([
    getPlayer({ id: params.playerId, userId }),
    getPlayerGames({ playerId: params.playerId, userId }),
  ]);

  if (!player) throw new Response("Not Found", { status: 404 });

  // Derive availableGameTypes from all games (unfiltered)
  // Compute stats from completed games only
  // Filter by selectedTypeId if set
  // Return json({ player, stats, history, availableGameTypes })
};
```

### Styling

- Card grid: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` (existing pattern)
- Stats numbers: `text-3xl font-bold text-blue-primary dark:text-blue-400`
- Win rate: `text-green-primary dark:text-green-400`
- Dates: `format(date, "do MMM yyyy")` from date-fns
- Dark mode support on all elements
- Mobile-first layout (primary target: iPhone PWA)

## Acceptance Criteria

### `/games/players` (Player List)

- [x]Route renders at `/games/players` under the games layout
- [x]Shows all players as tappable `Card` components
- [x]Each card displays: player name, completed games count
- [x]Cards sorted by most completed games (descending), alphabetical tiebreaker
- [x]Tapping a card navigates to `/games/players/${player.id}`
- [x]Empty state when no players exist
- [x]"Players" NavLink added to `GamesMenu` sidebar in `games.tsx`
- [x]Dashboard "Most Active Players" card title links to `/games/players`

### `/games/players/$playerId` (Player Detail)

- [x]Route renders player name as page header
- [x]Game type pill toggles filter all content via `?type=` search param
- [x]Stats section shows: games played, win rate, average score, highest score
- [x]When "All" selected: average score and highest score shown per game type
- [x]When type selected: all stats show single values for that type
- [x]Games without a game type included in overall stats, skipped in per-type breakdowns
- [x]Ties count as neither win nor loss in win rate
- [x]Stats only count completed games
- [x]Game history list shows all games (completed + in-progress), newest first
- [x]In-progress games display an "In Progress" badge
- [x]Completed games show placement (e.g., "1st of 3")
- [x]Each history row links to `/games/${game.id}`
- [x]404 if player doesn't exist or belongs to another user
- [x]Empty state for player with no completed games
- [x]Dark mode support throughout
- [x]Mobile-friendly layout (iPhone PWA primary target)

### Testing

- [x]Unit tests for loader (player list + player detail)
- [x]Unit tests for stats computation (wins, ties, averages, per-type grouping)
- [x]Unit tests for empty states and 404 cases

## Dependencies & Risks

- **Low risk:** Follows established patterns from the compare page almost exactly
- **Dependency:** `enrichPlayerScores` and `assignPlaces` from `game-utils.ts` (already stable)
- **Consideration:** List page uses `getTopPlayers` pattern (already returns game counts) — pass no limit to get all players

## Implementation Sequence

1. Add `getPlayerGames()` query to `game.server.ts` + expand `getPlayer` to include `id`
2. Create `/games/players.tsx` route (player list page) + co-located tests
3. Create `/games/players.$playerId.tsx` route (player detail page) + co-located tests
4. Add "Players" NavLink to `GamesMenu` in `games.tsx`
5. Make dashboard "Most Active Players" card title link to `/games/players`
6. Manual testing on mobile viewport

## Sources

- Compare page pattern: `app/routes/games/compare.$playerOne.$playerTwo.tsx`
- Game type filtering: `useSearchParams` + `?type=` param pattern
- Player queries: `app/models/game.server.ts` (`getAllPlayers`, `getPlayer`, `getTopPlayers`)
- Score enrichment: `app/game-utils.ts` (`enrichPlayerScores`, `assignPlaces`)
- Card component: `app/components/Card.tsx`
- Games layout/nav: `app/routes/games.tsx` (`GamesMenu`)
- Dashboard: `app/routes/games/index.tsx` (Most Active Players card)
