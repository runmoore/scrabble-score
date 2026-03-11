## Why

The recent pill-toggle redesign (#35) switched the add-player and add-game-type forms to use `useFetcher`, but the error display still reads from `useActionData`. Additionally, both forms hide themselves on submit via `onSubmit={() => setShow...(false)}`, so errors are never visible even if wired correctly. Whitespace-only names also bypass validation.

## What Changes

- Wire error display to `playerFetcher.data` and `gameTypeFetcher.data` instead of `actionData`
- Add error display to the game type form (currently missing entirely)
- Keep forms visible on validation error — only hide on successful submission
- Trim whitespace from name inputs server-side so `" "` triggers the empty-name error
- Remove stale `actionData` usage (no longer needed after fetcher migration)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `new-game-ui`: Add error handling for inline add-player and add-game-type forms; trim whitespace on name submissions

## Impact

- `app/routes/games/new.tsx`: Fix error wiring, conditional form visibility, add error display to game type form
- Action handler in same file: Add `.trim()` to name inputs before validation
