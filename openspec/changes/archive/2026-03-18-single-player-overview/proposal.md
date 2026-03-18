## Why

Users track multiple players across different game types (Scrabble, Sushi Go, Bananagrams), but there's no single place to see how a player is performing. Players only appear in the context of specific games or head-to-head comparisons. The only player-level data visible today is the "Most Active Players" card on the dashboard (top 3, game count only).

## What Changes

- Add a player list page (`/games/players`) showing all players with completed game counts
- Add a player detail page (`/games/players/$playerId`) with career stats, game type filtering via pill toggles, and full game history
- Add "Players" NavLink to the `GamesMenu` sidebar navigation
- Make the dashboard "Most Active Players" card title link to `/games/players`
- Add `getPlayerGames()` query to the game server model

## Capabilities

### New Capabilities

- `player-list`: Player list page at `/games/players` showing all players as tappable cards sorted by completed game count
- `player-detail`: Individual player detail page at `/games/players/$playerId` with career stats (games played, win rate, average score, highest score), game type pill toggle filtering, and full game history

### Modified Capabilities

- `games-dashboard`: "Most Active Players" card title becomes a link to `/games/players`

## Impact

- New files: `app/routes/games/players.tsx`, `app/routes/games/players.$playerId.tsx`
- Modified files: `app/models/game.server.ts` (new `getPlayerGames` query), `app/routes/games.tsx` (new NavLink), `app/routes/games/index.tsx` (dashboard link)
- New co-located test files for both routes
- No database schema or dependency changes
