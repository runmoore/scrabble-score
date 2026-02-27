## Why

When a game is completed, the summary page only shows final totals and the winner — there's no way to see the turn-by-turn scores without re-opening the game and navigating to the play screen. This makes it hard to retrospectively understand how a game unfolded, which is especially useful when classifying game types after the fact.

## What Changes

- Add a collapsible scores section to the game completed page that shows the full turn-by-turn score breakdown per player
- Extract the existing score table from the play page into a reusable component shared between both pages
- The scores section defaults to collapsed and can be toggled open/closed with a single tap

## Capabilities

### New Capabilities

- `completed-game-scores`: Expandable score breakdown on the game summary page, with a reusable score table component

### Modified Capabilities

## Impact

- **app/routes/games/$gameId.tsx**: Add toggle UI and render reusable score table
- **app/routes/games/$gameId.play.$playerId.tsx**: Refactor inline score table to use new shared component
- **New component**: Reusable score table component in `app/components/`
- No database or API changes required — the game summary route already loads scores via `getGame()`
