## 1. Add nextPlayerId to history items

- [x] 1.1 Import `getNextPlayerToPlay` from `~/game-utils` (if not already imported)
- [x] 1.2 In `buildGameHistory`, add `nextPlayerId` field: call `getNextPlayerToPlay()` for in-progress games, `null` for completed games

## 2. Update Link target

- [x] 2.1 Update the history row `<Link>` to use `/games/${game.id}/play/${game.nextPlayerId}` for in-progress games and `/games/${game.id}` for completed games

## 3. Verification

- [x] 3.1 Run `npm run typecheck` — no type errors
- [x] 3.2 Run `npm run lint` — no lint errors
- [x] 3.3 Run `npm test -- --run` — all existing tests pass
- [ ] 3.4 Manual: navigate to player detail, verify in-progress game links go to play screen
