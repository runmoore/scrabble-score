## 1. Server Queries

- [x] 1.1 Add `getTopGameTypes({ userId, limit })` function to `app/models/game.server.ts` that returns game types ranked by count of non-deleted games, with count included
- [x] 1.2 Add `getTopPlayers({ userId, limit })` function to `app/models/game.server.ts` that returns players ranked by count of non-deleted games played, with count included

## 2. Dashboard Loader

- [x] 2.1 Update the `games/index.tsx` loader to call both new query functions (limit 3) in parallel with the existing `getLastCompletedGame` call using `Promise.all`
- [x] 2.2 Add TypeScript types for the new loader data shape

## 3. Dashboard UI

- [x] 3.1 Add "Most Popular Games" card to the dashboard grid showing top 3 game types with counts, with empty state message when no game types exist
- [x] 3.2 Add "Most Active Players" card to the dashboard grid showing top 3 players with counts, with empty state message when no games played

## 4. Testing

- [x] 4.1 Add unit tests for `getTopGameTypes` and `getTopPlayers` query functions
- [x] 4.2 Add component/route tests for the new dashboard cards including empty states
