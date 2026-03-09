## 1. Replace N+1 queries with inline computation

- [x] 1.1 Remove the `Promise.all` + `getGame` map from the compare loader and replace with inline filter + map that computes `totalScore` per player from the scores already returned by `getAllGames`
- [x] 1.2 Compute `place` for each player based on `totalScore` ranking (higher score = place 1)
- [x] 1.3 Ensure the mapped result conforms to `EnhancedGame` with `PlayerWithScores` — verify with `npm run typecheck`
- [x] 1.4 Remove the unused `getGame` import from the compare route file (if no longer referenced)

## 2. Verify correctness

- [x] 2.1 Run existing unit tests (`npm test -- --run`) to confirm no regressions
- [x] 2.2 Run existing Cypress e2e tests for the compare page (`npm run test:e2e:run`) to confirm the page still renders correctly with accurate scores
