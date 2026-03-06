## Why

The compare page shows all 2-player games between two players regardless of game type. Users who play multiple game types (e.g., standard Scrabble, Super Scrabble) want to see head-to-head stats filtered by type, since mixing game types makes the stats less meaningful.

## What Changes

- Add interactive pill-style filter buttons at the top of the compare page for game type selection
- One pill per game type present in the two players' shared games, no "All games" pill
- Single-select: clicking a pill filters to that type, clicking it again returns to all games
- Filter state is synced to a URL search param (`?type=<id>`) so it's shareable and survives navigation/refresh
- All stat cards (all-time record, last 5, last game, highest score) recalculate based on the active filter
- When a filter is active, untyped games are excluded; deselecting returns to showing all games including untyped

## Capabilities

### New Capabilities

- `compare-game-type-filter`: URL-synced single-select pill filter on the compare page that filters games and stats by game type

### Modified Capabilities

- `compare-page-game-type`: The existing compare page display capability is affected — stats and table now respond to the active filter, and the loader returns available game types for the pill UI

## Impact

- **Route**: `app/routes/games/compare.$playerOne.$playerTwo.tsx` — loader reads search param, UI adds pill filter bar
- **No data model changes** — game type data is already loaded via `getGame()` includes
- **No new dependencies** — uses Remix's `useSearchParams` for URL sync
