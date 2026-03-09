## Why

Selecting players to compare requires navigating two dropdown menus every time, even when the user typically compares the same handful of player pairs. Surfacing the most frequently played matchups as quick-select cards reduces friction for the most common use case.

## What Changes

- Add a "Frequent Matchups" section above the existing dropdown selectors on the compare player-selection page (`/games/compare`)
- Each matchup card displays: both player names (e.g. "Alex vs Nora"), the number of head-to-head games played, and a comma-separated list of game types they've played together
- Cards are ordered by number of games played (most first)
- Clicking a card navigates directly to the comparison page for that pair
- The existing dropdown selectors remain unchanged as a fallback

## Capabilities

### New Capabilities

- `frequent-matchups`: Quick-select cards on the compare player-selection page showing the most-played player pairs with game counts and game types

### Modified Capabilities

_None — the existing compare page specs cover the comparison view itself; this change only affects the player-selection step before it._

## Impact

- **Routes**: `app/routes/games/compare.tsx` — loader needs to query games data to compute matchup pairs; UI gains a new card section
- **Models**: May leverage existing `getAllGames` or add a targeted query for 2-player game pair counts
- **No schema changes**: Uses existing Game, Player, and GameType relationships
- **No breaking changes**: Additive UI only; dropdowns remain functional
