## Context

The new game page (`app/routes/games/new.tsx`) uses `useState<string[]>([])` to track selected players. The Start Game button has `disabled={selectedPlayers.length < 2}`, which means the SSR HTML always renders a disabled button. Without JavaScript, the `onChange` handlers on checkbox inputs never fire, `selectedPlayers` stays empty, and the button can never be clicked.

The server action already validates `players.length < 2` at line 42 — but it currently `throw new Error(...)`, which results in an unhandled error boundary rather than a user-friendly inline message.

## Goals / Non-Goals

**Goals:**

- The Start Game button is always clickable in SSR HTML (no `disabled` attribute in server-rendered output)
- Server-side validation error ("select at least 2 players") is surfaced inline on the page
- When JS is available, the button still shows dynamic text reflecting player count
- Zero visual regression for JS-enabled users

**Non-Goals:**

- Fixing other no-JS issues (e.g., collapsible add-player/add-game-type forms also require JS) — tracked separately
- Adding a `useHydrated` hook or hydration detection (unnecessary for this change)
- Changing the button's visual styling or position

## Decisions

### Decision 1: Remove `disabled`, always allow form submission

**Choice**: Remove the `disabled` prop entirely. The button is always enabled and submittable.

**Rationale**: The server already validates player count. Duplicating this validation client-side as a `disabled` attribute creates the no-JS problem. Removing it is the simplest fix and aligns with Remix progressive enhancement: the server is the source of truth.

**Alternative considered**: CSS-only `:has()` selector to disable based on checked checkboxes. Rejected — the selector is complex (`form:has(input[name="players"]:checked ~ input[name="players"]:checked)`), brittle, and doesn't degrade gracefully in older browsers.

### Decision 2: Return JSON error from action instead of throwing

**Choice**: Change the `start-new-game` action case from `throw new Error(...)` to `return json({ errors: { players: "..." } }, { status: 400 })`. Use `useActionData` to read and display the error.

**Rationale**: `throw new Error` triggers the error boundary, which is a full-page error — not a good UX. Returning JSON matches the pattern already used by the `add-player` and `add-game-type` actions in the same file.

### Decision 3: Keep dynamic button text with JS, static text without

**Choice**: The button renders as "Start Game" in SSR. When JS hydrates, React state takes over and shows "Start Game (N players)" or "Select at least 2 players" based on `selectedPlayers.length`.

**Rationale**: Without JS, there's no way to update button text as checkboxes are toggled, so the static "Start Game" label is the best we can do. The CSS `:has()` approach could theoretically change text via `content` but it's fragile and inaccessible.

### Decision 4: Visual styling when JS indicates insufficient players

**Choice**: When JS is active and fewer than 2 players are selected, apply a muted visual style (e.g., `opacity-50`) instead of `disabled`. The button remains clickable but looks de-emphasized.

**Rationale**: This provides the same visual hint to JS users that they need more players, without actually preventing submission. The form can still submit and the server will catch it. This avoids the no-JS `disabled` trap while keeping the UX clear.

## Risks / Trade-offs

- **[Users can submit with 0-1 players]** → Server validates and returns an inline error. This is a feature, not a bug — progressive enhancement means the server is the safety net.
- **[Button text is static without JS]** → Acceptable trade-off. The text "Start Game" is clear enough. Users without JS won't see the player count, but they'll see the server error if they submit too early.
- **[Slight UX regression for JS users]** → The button is no longer truly `disabled`, just visually muted. Users could still click it. Mitigated by the server error appearing inline immediately.
