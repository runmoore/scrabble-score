## Why

The new game page (`/games/new`) uses unstyled browser-default radio buttons and checkboxes, bare input fields, and lacks visual hierarchy. It feels utilitarian compared to the rest of the app which uses the custom color palette, Card components, and polished mobile-first layouts. As the entry point for every game session, this page deserves a more engaging, touch-friendly experience — especially on iPhone where it's used as a PWA.

## What Changes

- Replace radio buttons for game type selection with toggleable pill buttons (single-select)
- Replace checkboxes for player selection with toggleable pill buttons (multi-select)
- Add section headings and visual grouping to separate game type, player selection, and add-new forms
- Style the text inputs and action buttons to match the app's existing design language (rounded, proper padding, custom colors)
- Improve spacing and layout for mobile touch targets
- Add a selected-player count indicator near the "Start new Game" button

## Capabilities

### New Capabilities

- `new-game-ui`: Visual design and interaction patterns for the new game creation page, including pill-toggle selectors, section layout, and form styling

### Modified Capabilities

None — this is a UI-only change with no behavior or data model modifications.

## Impact

- **Code**: `app/routes/games/new.tsx` (primary), potentially extract a reusable `PillToggle` component to `app/components/`
- **Dependencies**: None — uses only Tailwind CSS utilities already in the project
- **APIs/Data**: No changes — form submission and server actions remain identical
- **Tests**: Existing Cypress e2e tests for game creation may need selector updates if element structure changes
