## Why

The "Start Game" button on the new game page is permanently disabled when JavaScript is unavailable because the `disabled` attribute depends on React state (`useState<string[]>([])`). Without JS, the `onChange` handlers never fire, so the button never enables — users cannot start a game at all. While this is low-severity for a PWA targeting iPhone Safari, it violates Remix's progressive enhancement principle, and the server already validates that at least 2 players are selected.

## What Changes

- Remove the client-side `disabled` attribute from the Start Game button so it is always submittable in the SSR HTML
- Rely on the existing server-side validation (`players.length < 2` check in the action) to reject invalid submissions
- Surface server validation errors on the new game page when fewer than 2 players are submitted
- Preserve the current JS-enhanced UX: when JS is available, the button still shows dynamic text ("Start Game (N players)" / "Select at least 2 players") but is never `disabled` — instead, visual styling indicates readiness

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `new-game-ui`: The "Start game button with player count" requirement changes — the button is no longer disabled when fewer than 2 players are selected. Instead, it is always enabled and submittable, with server-side validation handling the error case.

## Impact

- **`app/routes/games/new.tsx`**: Remove `disabled` prop from the submit button; add error display for the server validation response when fewer than 2 players are submitted
- **Server action** (same file): The existing validation logic stays as-is, but its error response needs to be surfaced in the UI rather than throwing an unhandled error
- **No database, API, or dependency changes**
