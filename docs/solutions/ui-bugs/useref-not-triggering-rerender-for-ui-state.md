---
title: "useRef for navigation counter doesn't trigger re-render, causing stale disabled state on back button"
category: ui-bugs
date: 2026-03-30
tags:
  - react-hooks
  - useRef-vs-useState
  - stale-ui
  - remix-navigation
  - floating-action-button
severity: medium
components:
  - app/components/BackButton.tsx
  - app/icons/back-arrow.tsx
  - app/root.tsx
root_cause: >
  useRef mutations do not trigger React re-renders. When a ref tracked the
  navigation count, the component's disabled prop derived from that count
  was always one navigation behind because the render cycle never fired
  after the ref update. Replacing useRef with useState ensures each
  navigation increment causes a re-render, keeping the disabled state
  in sync with the actual history depth.
---

# useRef for navigation counter doesn't trigger re-render, causing stale disabled state

## Problem

A `BackButton` component tracked in-app navigation count using `useRef` to determine whether to disable the button (no history = disabled). The button's disabled state lagged by one navigation — it stayed disabled even after the user navigated, because ref mutations don't cause React to re-render.

## Root Cause

`useRef` mutations do not trigger React re-renders. When `location` changed, the component rendered first (reading the stale ref value), and only then did the `useEffect` increment `navigationCount.current`. Since nothing caused a subsequent re-render, `canGoBack` was always one navigation behind.

```tsx
// BROKEN: ref mutation doesn't trigger re-render
const navigationCount = useRef(0);
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  navigationCount.current += 1; // Mutates after render; no re-render triggered
}, [location]);

const canGoBack = navigationCount.current > 0; // Reads stale value from the current render
```

## Solution

Replace `useRef` with `useState` so that incrementing the count triggers a re-render, allowing the component to immediately reflect the updated value.

```tsx
// FIXED: useState triggers re-render when count changes
const [navigationCount, setNavigationCount] = useState(0);
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  setNavigationCount((prev) => prev + 1); // Triggers re-render with new value
}, [location]);

const canGoBack = navigationCount > 0; // Reads current value after re-render
```

## Key Insight

Use `useRef` for values you need to persist across renders but that do **not** affect rendered output. Use `useState` for any value that determines what the component displays (such as a disabled attribute). The rule is simple: **if the value drives UI, it must live in state so React knows to re-render when it changes.**

## Prevention Strategies

### Rules of Thumb: `useRef` vs `useState`

- **If the value affects what renders on screen, use `useState`.** This includes: text content, CSS classes, disabled/enabled states, conditional rendering, aria attributes.
- **If the value is only needed for side effects or imperative logic (and never touches JSX), use `useRef`.** Examples: storing a timer ID, tracking a previous value for comparison inside `useEffect`, holding a DOM node reference.
- **One-line test:** Search the component for the variable name inside the `return (...)` block or in any expression that feeds into JSX. If it appears there, it must be state, not a ref.

### How to Spot This During Code Review

1. **Grep for `.current` in JSX.** Any `someRef.current` used in the return statement (directly or via a derived variable) is a bug.
2. **Look for ref mutations without accompanying state updates.** If a ref is mutated and there is no `setState` call that forces a re-render, the new ref value will never be reflected in the UI.
3. **Check the motivation.** If you see "switched to useRef to avoid re-renders" but the value controls visible UI, that optimization is incorrect — the re-render is necessary.

### Test Case Pattern

Test the **rendered output** after the action, not the internal variable:

```tsx
it("enables the back button after navigating forward", async () => {
  render(<MyComponent />);

  const backButton = screen.getByRole("button", { name: /back/i });
  expect(backButton).toBeDisabled();

  // Simulate navigation
  await userEvent.click(screen.getByRole("button", { name: /forward/i }));

  // This assertion FAILS if the value is stored in a ref,
  // because the ref mutation doesn't trigger a re-render.
  expect(backButton).toBeEnabled();
});
```

## Related Documentation

- `docs/solutions/logic-errors/player-overview-code-review-findings.md` — UI state management issues and type-safety bugs found during code review
- `docs/solutions/logic-errors/compute-stats-refactoring.md` — Refactoring data computation that feeds into React rendering

## Cross-References

- PR #51: feat: add floating back button for mobile PWA navigation
- Issue #45: fix: in-progress games in player history link to wrong URL (related navigation/routing bug)
