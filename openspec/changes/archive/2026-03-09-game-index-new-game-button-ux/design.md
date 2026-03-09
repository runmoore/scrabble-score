## Context

The games index page (`app/routes/games/index.tsx`) renders a dashboard of cards (in-progress games, stats, last completed game) followed by a "New Game" link at the bottom. The page is rendered inside the games layout (`app/routes/games.tsx`) which provides a header, sidebar (desktop), and a `flex-1 flex-col px-2 py-6` content area via `<Outlet />`.

On mobile (primary target: iPhone PWA), users with several in-progress games must scroll past all cards to reach the "New Game" button — the most common action on this page.

## Goals / Non-Goals

**Goals:**

- Make "New Game" immediately accessible without scrolling on mobile
- Maintain visual hierarchy — the button should feel like the primary action
- Work correctly within the existing Remix layout structure (the index route renders inside `<Outlet />`)

**Non-Goals:**

- Changing the sidebar menu's existing "+ New Game" link (desktop users already have easy access via the sidebar)
- Redesigning the dashboard card layout or content
- Adding animation or transitions to the button

## Decisions

### 1. Fixed-position floating action button (FAB) on mobile

Use a `fixed bottom-6 right-4` positioned button that floats above page content on mobile viewports. On larger screens (`sm:` breakpoint and up), keep the button inline at the top of the card grid since the sidebar already provides a "New Game" link.

**Why FAB over other options:**

- **Sticky top bar**: Would eat into limited vertical space on mobile; header already takes significant room
- **Inline button at top**: Better than bottom, but still scrolls away when the user is mid-page reviewing scores
- **FAB**: Always visible, thumb-friendly position (bottom-right), well-established mobile pattern (Material Design, iOS conventions)

**Alternative considered — move inline button to top:** Simpler change, but doesn't solve the "scrolled mid-page" scenario. The FAB is a small incremental complexity for significantly better UX.

### 2. Remove the existing inline button

Replace the current `<Link>` block at the bottom of the page with the FAB. No need for two "New Game" buttons on the same page. On `sm:` and up, render it inline at the top of the card grid instead.

### 3. Tailwind-only implementation

Use Tailwind utility classes for all positioning and styling — `fixed`, `bottom-6`, `right-4`, `z-10`, `rounded-full`, `shadow-lg`. No custom CSS or inline styles needed. Hide the FAB on `sm:` and show an inline button instead using responsive display classes.

## Risks / Trade-offs

- **FAB overlapping content**: The floating button may overlap the bottom of the last card → Mitigate by adding `pb-20` bottom padding to the card grid on mobile so content scrolls clear of the FAB
- **z-index conflicts**: Fixed positioning could conflict with other overlays → Use `z-10` which is sufficient; no modals or overlays exist on this page
- **Two button styles (mobile FAB vs desktop inline)**: Slightly more markup → Acceptable trade-off for optimal UX on each form factor. Use responsive Tailwind classes (`sm:hidden` / `hidden sm:block`) to toggle between them
