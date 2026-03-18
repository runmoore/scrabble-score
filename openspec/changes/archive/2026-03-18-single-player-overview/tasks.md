## 1. Add getPlayerGames query to game.server.ts

- [x] 1.1 Add `getPlayerGames({ playerId, userId })` function to `app/models/game.server.ts` that fetches all games for a player with scores, players, and gameType
- [x] 1.2 Expand `getPlayer({ id, userId })` to also select `id` field

## 2. Create player list page

- [x] 2.1 Create `app/routes/games/players.tsx` with loader that fetches all players using `getTopPlayers` pattern (no limit)
- [x] 2.2 Implement player cards displaying name and completed game count, sorted by count descending with alphabetical tiebreaker
- [x] 2.3 Each card links to `/games/players/${player.id}`
- [x] 2.4 Add empty state: "No players yet. Create a game to add players."
- [x] 2.5 Add co-located unit tests for the player list loader and component

## 3. Create player detail page

- [x] 3.1 Create `app/routes/games/players.$playerId.tsx` with loader that fetches player and all player games in parallel
- [x] 3.2 Implement game type pill toggle filtering via `?type=` search param (toggleable, derived from all games)
- [x] 3.3 Implement stats section: games played, win rate, average score, highest score (computed from completed games only)
- [x] 3.4 When "All" selected: show average score and highest score as per-game-type breakdowns
- [x] 3.5 When type selected: show single values for all stats
- [x] 3.6 Implement win rate: wins / completed games, ties not counted as wins
- [x] 3.7 Handle games without game type: included in overall stats, skipped in per-type breakdowns
- [x] 3.8 Implement game history list: all games (completed + in-progress), newest first, scrollable
- [x] 3.9 In-progress games show "In Progress" badge; completed games show placement
- [x] 3.10 Each history row links to `/games/${game.id}`
- [x] 3.11 Return 404 for non-existent player or wrong user
- [x] 3.12 Empty state for player with no completed games
- [x] 3.13 Add co-located unit tests for loader, stats computation, empty states, and 404

## 4. Navigation integration

- [x] 4.1 Add "Players" NavLink to `GamesMenu` in `app/routes/games.tsx`
- [x] 4.2 Make dashboard "Most Active Players" card title a link to `/games/players` in `app/routes/games/index.tsx`

## 5. Verification

- [x] 5.1 Run `npm run typecheck` — no type errors
- [x] 5.2 Run `npm run lint` — no lint errors
- [x] 5.3 Run `npm test -- --run` — all tests pass
- [ ] 5.4 Manual testing on mobile viewport
