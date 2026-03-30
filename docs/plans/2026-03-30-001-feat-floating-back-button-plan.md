---
title: "feat: Add floating back button for mobile navigation"
type: feat
status: active
date: 2026-03-30
---

# feat: Add floating back button for mobile navigation

## Overview

In standalone PWA mode there are no browser chrome controls, making it impossible to navigate back. Add a floating action button (FAB) on the bottom-left of every page that mirrors the existing "New Game" FAB style and provides back navigation for mobile users.

## Problem Statement / Motivation

The app is a PWA optimized for iPhone home screen installation (`display: standalone`). Once installed, the browser's back button disappears entirely. Users currently have no way to return to a previous page without closing and reopening the app. This is a core usability gap for the primary target platform.

## Proposed Solution

A `<BackButton />` component rendered globally in `root.tsx`, positioned bottom-left to mirror the existing "New Game" FAB (bottom-right). The button uses `navigate(-1)` and is disabled when there's no in-app navigation history. Only visible within `/games` routes.

### Key Design Decisions

1. **Placement: `root.tsx`, scoped to `/games`** — Rendered in `root.tsx` for simplicity but only visible on `/games/*` routes. Other routes (cryptogram, anagram, login) don't show the button.

2. **History detection: In-app navigation counter** — `window.history.length` is unreliable in PWAs (Safari preserves it across sessions). Instead, track an in-app navigation count using a `useRef` that increments on each `useLocation` change. Initialize to 0; disable the button when count is 0. **Important:** the `useEffect` watching `location` fires on mount with the initial location — this first invocation must be skipped (e.g., with an `isFirstRender` ref guard) so the counter stays at 0 until the user actually navigates.

3. **Always on mobile** — Visible on all mobile viewports (`sm:hidden`), not gated to PWA standalone mode. Desktop/tablet users have browser back buttons.

4. **Disabled state on first page** — Button renders on every page but is visually dimmed and non-interactive when there's no history to go back to.

5. **Hidden during active gameplay** — The back button is completely hidden on play routes (`/games/*/play/*`). Navigating back mid-game is confusing and disruptive to the turn-by-turn flow. Detect via `useLocation().pathname` matching `/games/.+/play/.+`.

## Technical Considerations

### Files to Create

- **`app/icons/back-arrow.tsx`** — SVG back arrow icon component, following the same pattern as `app/icons/menu.tsx`
- **`app/components/BackButton.tsx`** — The floating back button component

### Files to Modify

- **`app/root.tsx`** — Render `<BackButton />` adjacent to `<Outlet />` inside the body.

### Styling (matching existing FAB)

The existing "New Game" FAB uses:

```
fixed bottom-6 right-4 z-10 rounded-full bg-blue-500 px-5 py-3
text-lg font-semibold text-white shadow-lg
hover:bg-blue-600 focus:bg-blue-400
dark:bg-blue-700 dark:hover:bg-blue-600
sm:hidden
```

The back button mirrors this on the left with `p-3` (uniform padding for an icon-only circular button, vs `px-5 py-3` for the text-based "New Game" FAB):

```
fixed bottom-6 left-4 z-10 rounded-full bg-blue-500 p-3
text-white shadow-lg
hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-600
dark:bg-blue-700 dark:hover:bg-blue-600
disabled:bg-blue-100
sm:hidden
```

Disabled state: use the HTML `disabled` attribute on the `<button>` element (handles click prevention and accessibility natively). Style with `disabled:bg-blue-100`.

### Edge Cases

| Scenario                            | Behavior                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| PWA cold launch (no history)        | Button visible but disabled (dimmed)                                                                    |
| After login redirect to `/games`    | Back goes to login page (accepted trade-off; fixing requires login redirect changes — separate concern) |
| Active gameplay (`/games/*/play/*`) | Button hidden entirely — back navigation is disruptive during turn-by-turn play                         |
| Both FABs visible on `/games` index | Symmetrical layout: back on left, "New Game" on right                                                   |
| Non-`/games` routes                 | Button hidden — only visible within `/games/*`                                                          |

### Accessibility

- `aria-label="Go back"` on the button
- `disabled` attribute when no history (removes from tab order)

## Acceptance Criteria

- [x] Floating circular back button appears bottom-left on `/games` routes at mobile viewport (`sm:hidden`), except during active gameplay
- [x] Button is hidden on play routes (`/games/*/play/*`)
- [x] Button style matches existing "New Game" FAB (blue, rounded, shadow, dark mode support)
- [x] Tapping navigates back one page via `navigate(-1)`
- [x] Button is visually disabled (dimmed, non-interactive) when on the first page with no history
- [x] Button has `aria-label="Go back"` for screen readers
- [x] No SSR hydration errors (component renders identically on server and client)
- [x] Back arrow icon follows existing `app/icons/menu.tsx` component pattern
- [x] Works correctly in both standalone PWA mode and regular mobile browser

## Success Metrics

- Users in PWA standalone mode can navigate backward without closing the app
- No layout shift or overlap issues with existing FABs

## Dependencies & Risks

- **Low risk**: Self-contained UI addition, no database or API changes
- **Post-login back navigation** is a known rough edge but is a separate concern from this feature (would require changing session redirect behavior in `app/session.server.ts`)
- **Safe area insets**: The existing FAB already uses `bottom-6` in standalone mode — if that works today, the back button at the same offset will too

## Sources & References

- Existing FAB: `app/routes/games/index.tsx:169-174`
- Icon pattern: `app/icons/menu.tsx`
- Games layout: `app/routes/games.tsx`
- Root shell: `app/root.tsx`
- PWA manifest: `public/manifest.json`
