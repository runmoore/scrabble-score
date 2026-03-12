## Why

The `sr-only` input + `peer-checked:` label pill pattern is duplicated twice in `new.tsx` (game type radios and player checkboxes) with identical `pillBase`/`pillUnselected` style strings copied inline. Any styling change requires two edits, and the pattern will drift as more pill uses appear.

## What Changes

- Extract a reusable `PillToggle` component encapsulating the visually-hidden input + styled label pill pattern
- Replace both inline pill implementations in `new.tsx` with `PillToggle`
- Remove the `pillBase` and `pillUnselected` local variables from `new.tsx`

## Capabilities

### New Capabilities

- `pill-toggle`: Reusable component for the sr-only input + peer-checked label pill pattern, supporting radio/checkbox types and configurable colors

### Modified Capabilities

- `new-game-ui`: Implementation detail only — pills now render via `PillToggle` component instead of inline markup. No requirement-level behavior change.

## Impact

- New file: `app/components/PillToggle.tsx`
- Modified file: `app/routes/games/new.tsx` (reduced duplication, imports new component)
- No API, database, or dependency changes
- Pure refactor — no visual or behavioral change
