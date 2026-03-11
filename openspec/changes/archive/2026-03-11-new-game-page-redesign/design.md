## Context

The new game page (`app/routes/games/new.tsx`) is a single-route form with three responsibilities:

1. Select a game type (optional, single-select radio buttons)
2. Select players (multi-select checkboxes, minimum 2)
3. Add new game types and players (two small forms)

The current implementation uses unstyled native form controls. The rest of the app uses Tailwind utility classes with the project's custom color palette (`blue-primary`, `green-primary`, `purple-primary`, etc.) and a `Card` component for grouped content. The page needs to match that level of polish while preserving all existing form submission behavior (Remix `Form` + server `action`).

## Goals / Non-Goals

**Goals:**

- Visually align the new game page with the app's existing design language
- Replace native radio/checkbox inputs with touch-friendly pill toggles
- Create clear visual sections for each form responsibility
- Maintain progressive enhancement (forms work without JS)
- Keep the page mobile-first and optimized for iPhone PWA use

**Non-Goals:**

- Changing server-side logic, data model, or API behavior
- Adding animations or transitions beyond Tailwind defaults
- Creating a generic design system or component library
- Redesigning other pages

## Decisions

### 1. Pill toggle pattern using hidden inputs + styled labels

**Choice**: Use visually-hidden `<input>` elements with styled `<label>` elements acting as pills, rather than fully custom components with `useState` click handlers.

**Why over custom components**: The hidden-input approach preserves native form semantics — `<input type="radio">` for game type (single-select) and `<input type="checkbox">` for players (multi-select). This means:

- Form data submits correctly without JS (progressive enhancement)
- The existing `action` function works without modification
- Keyboard navigation and screen reader support come for free
- The `onChange` handler for tracking `selectedPlayers` state still works

**Implementation**: Use Tailwind's `peer` modifier — hide the input with `sr-only`, then style the adjacent label with `peer-checked:` variants for the selected state.

### 2. Section layout using existing Card component

**Choice**: Wrap each section (game type, player selection, add forms) in the existing `Card` component with section headings.

**Why over flat layout**: Cards provide visual grouping, consistent border/shadow treatment, and match the pattern used on the games index page. This avoids inventing new container styles.

### 3. Inline "add new" forms with collapsible pattern

**Choice**: Move the "add player" and "add game type" forms into their respective sections with a simple text-button trigger (e.g., "+ Add player") that reveals the input inline, rather than keeping them as a separate column.

**Why over separate column**: The current two-column layout (`lg:flex-row`) wastes space on mobile and separates the "add" action from the context where it's needed. Placing "+ Add player" directly below the player pills makes the workflow more intuitive: see players → notice one missing → add it right there.

### 4. Hidden form + `useFetcher` to avoid nested `<form>` elements

**Choice**: Use a hidden `<Form id="new-game-form">` for the main game submission, with radio/checkbox inputs and the start button associated via the HTML `form` attribute. Use `useFetcher` for the add-player and add-game-type forms so they render as sibling `<form>` elements rather than nested children.

**Context (discovered during implementation)**: The original design assumed the collapsible add-forms (Decision 3) could live inside a single wrapping `<Form>`. In practice, this creates nested `<form>` elements — the outer game-start form containing inner add-player and add-game-type forms. Nested `<form>` is invalid HTML: browsers flatten the nesting during SSR, then React's hydration sees a DOM mismatch and throws errors (#418, #423).

**Why this approach over alternatives**:

- **Single `<Form>` with nested `<Form>`s** (original plan): Invalid HTML, causes React hydration errors.
- **All actions via one form with different submit buttons**: Would work but conflates the add-player/add-game-type actions with the start-game action in a single form. The `action` field already disambiguates on the server, but having separate forms keeps concerns cleanly separated and allows `useFetcher` to handle the add actions without a full page navigation.
- **All actions via `useFetcher`**: The start-game action needs to redirect to the play page, which `useFetcher` doesn't do natively (fetchers don't navigate). Keeping the main form as a Remix `<Form>` preserves the redirect behaviour.

**Trade-off**: The `form` HTML attribute pattern is less common and slightly harder to follow than a simple wrapping `<Form>`. The hidden form element with `className="hidden"` also has a potential no-JS concern (documented in `future-no-js-hidden-form.md`).

### 5. Color assignments for pill states

**Choice**:

- **Game type pills**: `blue-primary` background when selected, `gray-100` / `dark:gray-700` when unselected
- **Player pills**: `purple-primary` background when selected, `gray-100` / `dark:gray-700` when unselected
- **Start button**: `green-primary` when enabled, `gray-200` when disabled

**Why**: Blue and purple are already used semantically in the app (blue = primary actions, purple = secondary/player-related). Green for the start button matches the "positive action" pattern used elsewhere.

### 5. Selected player count on the start button

**Choice**: Show the count directly in the button text: "Start Game (3 players)" when >= 2 selected, "Select at least 2 players" when < 2.

**Why over a separate indicator**: Reduces visual clutter and puts the information exactly where the user needs it — at the point of action.

## Risks / Trade-offs

- **Cypress selector changes** → Existing e2e tests use `input[type="checkbox"]` and `input[type="radio"]` selectors. The inputs still exist (just visually hidden), so `cy.get` by role should still work. Tests using visual assertions may need updates. Mitigation: verify with `cy.findByRole` which queries the a11y tree.
- **Peer modifier browser support** → Tailwind's `peer` modifier uses CSS `:has()` and general sibling combinators which are well-supported in modern browsers, and certainly in Safari/iOS which is the target platform. No concern.
- **Card component fitness** → The `Card` component may need minor adjustments (e.g., removing default padding if pills need edge-to-edge layout). Mitigation: use Card's existing props or add a `className` override if needed rather than modifying the component itself.
