## No-JS: Start button is permanently disabled

**Type:** Pre-existing issue (not a regression from the redesign)

The button's `disabled` attribute is controlled by `selectedPlayers.length < 2`, where `selectedPlayers` is initialised as `useState<string[]>([])`. Without JS:

- The `onChange` handler on checkbox inputs never fires
- `selectedPlayers` stays empty forever
- The button renders as disabled in the SSR HTML and never becomes enabled
- Users cannot start a game at all

The previous implementation had the same issue — `selectedPlayers` state was always used to gate the button.

**Severity:** Low for this app (PWA targeting iPhone Safari where JS is always available), but violates the Remix progressive enhancement principle.

**Possible fixes:**

1. **Remove `disabled`, rely on server validation (recommended)** — The server action already validates `players.length < 2` and throws an error. Let the form submit and show the error server-side. The button text could still show the player count with JS via `useHydrated()`, but render as a static "Start Game" label in SSR without the disabled attribute.

2. **CSS-only `:has()` for button state** — Use a CSS selector like `form:has(input[name="players"]:checked ~ input[name="players"]:checked)` to enable/style the button purely with CSS. Avoids JS entirely but the selector is complex and brittle.

**Relevant code:**

- `app/routes/games/new.tsx` line 86: `useState<string[]>([])`
- `app/routes/games/new.tsx` line 263: `disabled={selectedPlayers.length < 2}`
- `app/routes/games/new.tsx` line 43: server-side validation `if (players.length < 2) { throw new Error(...) }`
