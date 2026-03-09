## 1. Loader — matchup computation

- [x] 1.1 Add `getAllGames` import to `app/routes/games/compare.tsx` loader and call it alongside `getAllPlayers`
- [x] 1.2 Implement matchup aggregation: iterate 2-player completed games, build canonical pair map (sorted IDs), track game count and game type names per pair
- [x] 1.3 Sort pairs by game count descending, slice to top 3, return `{ players, matchups }` from loader

## 2. UI — matchup cards

- [x] 2.1 Update `useLoaderData` destructuring in the component to `{ players, matchups }`
- [x] 2.2 Render matchup cards above the dropdown form using `Card` component with `asLink` and `to` props
- [x] 2.3 Display game count with correct singular/plural ("1 game" vs "N games") and game types as comma-separated smaller text, omitting game types line when empty

## 3. Tests

- [x] 3.1 Add loader unit tests: matchup aggregation with multiple pairs, ordering, 3-card limit, completed-only filtering, 2-player-only filtering, game types collection and alphabetical sorting, empty game types omission
- [x] 3.2 Add component render tests: cards appear when matchups exist, cards hidden when no matchups, card content (names, count, game types), card links to correct URL
