## 1. Extract ScoreTable Component

- [x] 1.1 Create `app/components/ScoreTable.tsx` with props: `players` (array with scores and totalScore), `topScore` (number). Extract the columnar score rendering logic from the play page (lines 135-170 of `$gameId.play.$playerId.tsx`): player name with truncation, individual score rows, empty-row padding, and bordered total row with yellow leader highlight. Keep layout margins out of the component.

## 2. Integrate ScoreTable into Play Page

- [x] 2.1 Replace the inline score table in `app/routes/games/$gameId.play.$playerId.tsx` with `<ScoreTable>`. Pass existing `game.players` and `topScore` props. Verify the rendered output is visually identical.

## 3. Add Expandable Scores to Completed Game Page

- [x] 3.1 Add a toggle button and collapsible ScoreTable to `app/routes/games/$gameId.tsx`. Use `useState` to manage open/closed state (default: closed). Compute `topScore` from players data. Place the toggle and score section between the standings summary and the action buttons. Style the toggle button to match existing UI conventions with a chevron indicator. Use the frontend-design skill for polished interaction design.

## 4. Testing

- [x] 4.1 Add unit tests for the ScoreTable component covering: rendering all players with scores, leader highlighting, uneven turn padding, and name truncation.
- [x] 4.2 Run lint, typecheck, and format to verify code quality.
