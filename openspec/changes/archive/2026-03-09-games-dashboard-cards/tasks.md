## 1. Shared Leaderboard Component

- [x] 1.1 Create `app/components/Leaderboard.tsx` with `LeaderboardPlayer` and `LeaderboardProps` interfaces. Extract the place/name/score three-column layout and ordinal formatting (`getNumberWithOrdinal`) from `app/routes/games/$gameId.tsx` into this component.
- [x] 1.2 Refactor `app/routes/games/$gameId.tsx` to import and use the `Leaderboard` component, removing the inline markup (lines ~186-203) and the `getNumberWithOrdinal` helper. Verify visual output is identical.
- [x] 1.3 Add unit tests for the `Leaderboard` component covering: basic rendering, tied first-place players with trophy emoji, and ordinal formatting (1st, 2nd, 3rd, 4th).

## 2. Server Data Layer

- [x] 2.1 Add `getLastCompletedGame({ userId })` to `app/models/game.server.ts`. It should query for the most recently created completed game (ordered by `createdAt` desc, `completed: true`, `deletedAt: null`), include players and scores, compute `totalScore` per player, sort players by score descending, and assign ordinal `place` values.
- [x] 2.2 Add unit tests for `getLastCompletedGame` covering: returns the most recent completed game with correct totals, returns null when no completed games exist.

## 3. Games Index Route — Loader

- [x] 3.1 Add a loader to `app/routes/games/index.tsx` that calls `getLastCompletedGame({ userId })` and returns it alongside any data needed from the parent route. Derive `completedGameCount` from the parent loader's games array (filter by `completed === true`).

## 4. Games Index Route — Dashboard UI

- [x] 4.1 Replace the current plain list in `app/routes/games/index.tsx` with a responsive card grid layout (`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`).
- [x] 4.2 Implement in-progress game cards using the `Card` component with accent style. Each card shows player names, game type (if present), relative time (`formatDistanceToNow`), and each player's current total score. Card links to the play screen for the next player. Compute player totals from the parent loader's raw scores.
- [x] 4.3 Implement the completed games count card showing the total number of completed games.
- [x] 4.4 Implement the last completed game card showing game type, date, and the shared `Leaderboard` component with final standings. Only render when a last completed game exists.
- [x] 4.5 Retain the "New Game" button in the dashboard layout.
- [x] 4.6 Handle empty states: no in-progress games (show only summary cards), no completed games (count shows zero, last completed card hidden).

## 5. Verification

- [x] 5.1 Run existing Vitest tests (`npm test -- --run`) and confirm no regressions from the Leaderboard extraction.
- [x] 5.2 Run TypeScript type checking (`npm run typecheck`) to confirm no type errors.
- [x] 5.3 Manually verify the games index page on mobile (375px), tablet (768px), and desktop (1920px) viewports.
