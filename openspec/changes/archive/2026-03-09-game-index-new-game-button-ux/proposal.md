## Why

The "New Game" button on the games index page sits below all dashboard cards, forcing mobile users to scroll past in-progress games, stats, and leaderboard cards just to start a new game. On iPhone (the primary target), this is the most common action and should be immediately accessible without scrolling.

## What Changes

- Relocate the "New Game" button from below the card grid to a persistent, prominent position
- Make the button visually distinct as the primary call-to-action on the page
- Ensure the button remains accessible regardless of how many in-progress games or dashboard cards are displayed

## Capabilities

### New Capabilities

- `sticky-new-game-button`: Persistent floating action button (FAB) for starting a new game on the games index page, always visible on mobile without scrolling

### Modified Capabilities

_None — this is a layout/UX change to the games index page, no existing spec-level requirements change._

## Impact

- **Code**: `app/routes/games/index.tsx` — button placement and styling
- **Styling**: New Tailwind classes for fixed/sticky positioning
- **No API/data changes**: Pure frontend UX improvement
