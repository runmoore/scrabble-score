## Desktop layout feels shoe-horned

The new game page uses `max-w-lg` (~512px) centred on screen, which works perfectly on mobile but looks like a narrow column floating in empty space on desktop. The rest of the app adapts to wider screens:

- **Games index**: responsive grid (`md:grid-cols-2 lg:grid-cols-3`)
- **Play page**: side-by-side layout at `lg:flex-row`
- **Compare pages**: responsive grids up to 3 columns
- **Login/Join**: `max-w-md` — but those are simple forms where narrow is fine

The new game page has more content density than login — two Card sections, pills, collapsible forms — and could use the extra width.

**Options to investigate:**

1. **Side-by-side Cards on desktop** — At `lg:` breakpoint, place Game Type and Players cards in a two-column grid (`lg:grid-cols-2`). Each card gets more breathing room, the page fills the viewport naturally, and the start button could span full width below both cards.

2. **Wider max-width** — Change `max-w-lg` to `max-w-2xl` or `max-w-4xl` so the single-column layout doesn't feel cramped on desktop. Simpler change but doesn't fully utilise space.

3. **Match the play page pattern** — The play page uses `flex-col lg:flex-row lg:justify-around`. The new game page could mirror this: cards stacked on mobile, side-by-side on desktop.

**Recommendation:** Option 1 (side-by-side Cards) mirrors the games index grid pattern and is the most natural fit. The start button would work well as a full-width element below the grid, creating a clear visual flow: choose type → choose players → start.

**What NOT to change:** The mobile layout is good as-is. Any desktop improvement should only kick in at `lg:` or `md:` breakpoints.
