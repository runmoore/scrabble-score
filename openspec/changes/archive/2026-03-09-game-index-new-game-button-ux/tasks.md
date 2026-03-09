## 1. Remove existing bottom button

- [x] 1.1 Remove the `<Link to="new">` block at the bottom of the card grid in `app/routes/games/index.tsx` (lines 162-167)

## 2. Add mobile floating action button

- [x] 2.1 Add a fixed-position `<Link to="new">` FAB with Tailwind classes: `fixed bottom-6 right-4 z-10 rounded-full shadow-lg` styled as the primary action, visible only below `sm:` breakpoint (`sm:hidden`)
- [x] 2.2 Add `pb-20 sm:pb-0` bottom padding to the card grid `<div>` so the last card is not obscured by the FAB on mobile

## 3. Add desktop inline button

- [x] 3.1 Add an inline `<Link to="new">` above the card grid, hidden on mobile and visible at `sm:` breakpoint (`hidden sm:block`), styled consistently with the existing button design

## 4. Verify

- [x] 4.1 Visually verify on mobile viewport: FAB is visible without scrolling, stays fixed while scrolling, and navigates to `/games/new`
- [x] 4.2 Visually verify on desktop viewport: inline button appears above cards, no FAB visible, navigates to `/games/new`
- [x] 4.3 Verify last dashboard card is fully visible when scrolled to bottom on mobile (not obscured by FAB)
