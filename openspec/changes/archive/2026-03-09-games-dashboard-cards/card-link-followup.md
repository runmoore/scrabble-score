# Follow-up: Card component should use Remix `<Link>` instead of `<a>`

## Problem

The `Card` component (`app/components/Card.tsx`) renders a plain `<a href>` tag when `asLink` is true. This causes full page reloads instead of Remix client-side transitions, losing:

- Client-side navigation (no full page reload)
- Prefetch capabilities (`<Link prefetch="intent">`)
- Transition state awareness (pending UI via `useNavigation`)

## Current usage

The Card link pattern is used in:

- `app/routes/games/index.tsx` — in-progress game cards, last completed game card
- `app/routes/games/compare.tsx` — matchup cards
- `app/routes/games/compare.$playerOne.$playerTwo.tsx` — stat cards that link to games

## Proposed fix

Update `Card.tsx` to use Remix `<Link>` instead of `<a>`:

```tsx
import { Link } from "@remix-run/react";

// In the asLink branch:
if (asLink && to) {
  return (
    <Link
      to={to}
      className={`${cardClasses} block transition-shadow hover:shadow-lg`}
    >
      {content}
    </Link>
  );
}
```

## Scope

- Small change to `Card.tsx`
- No prop changes needed — `to` already matches Remix `<Link>` API
- Verify all existing Card usages still work (compare page, dashboard, compare detail)
- Should be its own PR since it affects all Card consumers
