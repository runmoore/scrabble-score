## Pill component abstraction

There are three distinct pill-like patterns across the app, each implemented independently with inline Tailwind classes:

**1. Peer-checked pill selector** (`app/routes/games/new.tsx`)

- Hidden `sr-only` input + styled label using `peer-checked:` variants
- Used for game type (radio, single-select) and player (checkbox, multi-select) selection
- Pill styles defined as local string variables (`pillBase`, `pillUnselected`)
- Color varies by context: `blue-primary` for game types, `purple-primary` for players

**2. Action button pills** (`app/components/GameTypeSection.tsx`)

- Simple `<button>` elements styled with `rounded bg-blue-primary px-3 py-1`
- Used on play/summary screens to assign a game type to a game
- Not a toggle — each button submits a form
- Uses `rounded` not `rounded-full`, so slightly different shape

**3. Tag chips with dismiss** (`app/routes/anagram.tsx`)

- `<div>` wrappers with `rounded-full border-2` containing a close button and a link
- Active/inactive state toggled by comparing to current search query
- Horizontal scrollable row with `overflow-x-auto`
- Uses a completely different colour scheme (gray-800 active, transparent inactive)

**Analysis:**

These three patterns share the _visual concept_ (small, rounded, inline selection elements) but differ significantly in semantics:

| Aspect       | New Game Pills              | GameTypeSection      | Anagram Tags       |
| ------------ | --------------------------- | -------------------- | ------------------ |
| Element      | `<input>` + `<label>`       | `<button>`           | `<div>` + `<Link>` |
| Selection    | Toggle on/off               | One-shot submit      | Navigate + dismiss |
| Multi-select | Yes (checkbox) / No (radio) | No                   | N/A                |
| State source | Native `:checked`           | None (server action) | React state        |
| Shape        | `rounded-full`              | `rounded`            | `rounded-full`     |

**Potential abstractions:**

- **`PillToggle` component**: Wraps the `sr-only` input + `peer-checked:` label pattern. Props: `name`, `value`, `type` (`radio` | `checkbox`), `color` (`blue` | `purple` | etc), `form?` (for HTML form association), `onChange?`. This would DRY up the new game page and could replace `GameTypeSection`'s buttons if that component were refactored.

- **`PillChip` component**: A simpler visual-only pill for display/navigation. Props: `children`, `active?`, `onDismiss?`, `href?`. Would cover the anagram tags pattern.

- **Shared pill styling**: At minimum, extract the base classes (`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer select-none`) into a Tailwind `@apply` utility or a shared constant, so all pill-like elements have consistent sizing and shape.

**Recommendation:** Start with `PillToggle` since it has the clearest reuse case — the new game page already duplicates the pattern for game types and players, and `GameTypeSection` could adopt it. `PillChip` is lower priority since the anagram tags are the only user. A shared base style constant is the lowest-effort win.

**Risk:** Over-abstracting too early. Currently there are only 3 pill patterns. If the app grows more pill use cases, the abstraction pays off. For now, the inline approach works and is easy to read. Consider extracting only when a 4th use case appears or when the existing patterns need to change in sync.
