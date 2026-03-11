## No-JS: Collapsible add forms are permanently hidden

**Type:** Regression introduced by the redesign

The add-player and add-game-type forms are gated behind `showAddPlayer` / `showAddGameType` state (both `useState(false)`). Without JS:

- The toggle buttons (`+ Add player`, `+ Add game type`) render but `onClick` never fires
- The forms never become visible
- Users cannot add new players or game types

The previous implementation had these forms always visible — this is a functional regression.

**Severity:** Low for this app (PWA with JS always available), but it means the page is non-functional without JS.

**Recommended fix:**

Render the forms visible by default in SSR, then progressively enhance into the collapsible toggle pattern after hydration. Approach:

```tsx
// Hook to detect client-side hydration
function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// In the component:
const hydrated = useHydrated();
const [showAddPlayer, setShowAddPlayer] = useState(false);

// Show form if: not yet hydrated (SSR/no-JS) OR user toggled it open
const addPlayerVisible = !hydrated || showAddPlayer;
```

This way:

- **Without JS**: Forms are always visible, matching the previous behaviour
- **With JS**: Forms start hidden after hydration, user toggles them open
- No flash of content — the forms are visible in SSR HTML, then hide on hydration

**Relevant code:**

- `app/routes/games/new.tsx` lines 87-88: `useState(false)` for both toggles
- `app/routes/games/new.tsx` lines 156-189: game type collapsible form
- `app/routes/games/new.tsx` lines 220-254: player collapsible form
