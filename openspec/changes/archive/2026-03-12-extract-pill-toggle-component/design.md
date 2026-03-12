## Context

`app/routes/games/new.tsx` contains two instances of the same pill toggle pattern: game type radios (blue) and player checkboxes (purple). Both use identical `pillBase`/`pillUnselected` class strings with a visually-hidden `<input>` + `peer-checked:` `<label>` approach. The only differences are input type (radio vs checkbox), color, and event handlers.

## Goals / Non-Goals

**Goals:**

- Single source of truth for the pill toggle markup and styling
- Type-safe color prop with exhaustive `Record<PillColor, string>` mapping
- Drop-in replacement — zero visual or behavioral change

**Non-Goals:**

- Replacing `GameTypeSection.tsx` button pills (different pattern: `<button>` with server action, not input+label)
- Replacing anagram tag chips (different pattern: `<div>` + `<Link>`)
- Adding new colors or variants beyond what's currently used

## Decisions

**Component API**: Props-based with `children` for label content. `type` (`radio` | `checkbox`), `color` (`blue` | `purple`), `name`, `value`, `id` as required props. Optional `form`, `onChange`, `defaultChecked`.

_Rationale_: Mirrors the native `<input>` API closely, making adoption obvious. `children` for label text keeps usage concise.

**Color mapping via `Record<PillColor, string>`**: A const object mapping color names to Tailwind `peer-checked:` classes, typed as `Record<PillColor, string>`.

_Rationale_: TypeScript enforces exhaustiveness — adding a color to the union without updating the map is a compile error.

**Wrapper `<div>` retained**: Each `PillToggle` renders a `<div>` wrapping the input+label pair.

_Rationale_: The `peer` selector requires the input and label to be siblings within a common parent. The wrapping div scopes `peer` correctly when multiple pills are adjacent.

## Risks / Trade-offs

- [Extra wrapper div] → Acceptable; required for `peer` CSS scoping. No layout impact since parent uses `flex-wrap`.
- [Limited to two colors] → By design. The `PillColor` union is trivially extensible when a third color is needed.
