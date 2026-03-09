## Why

The games dashboard currently shows in-progress games and a simple completed games count, but provides no insight into gameplay patterns. Users with many games have no way to see which games are most popular or which players are most active. Adding top-3 stats cards gives users a quick snapshot of their Scrabble habits.

## What Changes

- Add a "Most Popular Games" card to the dashboard showing the top 3 game types by number of games played, with counts
- Add a "Most Active Players" card to the dashboard showing the top 3 players by number of games played, with counts
- New server-side queries to aggregate game type popularity and player activity

## Capabilities

### New Capabilities

- `dashboard-stats`: Top-3 most popular game types and top-3 most active players displayed as dashboard cards with counts

### Modified Capabilities

- `games-dashboard`: Adding two new stats cards to the existing dashboard grid layout

## Impact

- `app/models/game.server.ts`: New query functions for aggregating game type counts and player game counts
- `app/routes/games/index.tsx`: Updated loader to fetch stats data, new card components for display
- No schema changes required — all data derivable from existing relations
