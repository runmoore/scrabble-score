## 1. Layout Changes

- [x] 1.1 Change outer wrapper in `app/routes/games/new.tsx` from `max-w-lg` to `max-w-lg lg:max-w-4xl`
- [x] 1.2 Add `lg:grid lg:grid-cols-2 lg:items-start` to the container holding the two Card sections (Game Type and Players), keeping `flex flex-col gap-6` for mobile
- [x] 1.3 Ensure the Start Game button remains outside the grid as a full-width sibling below both cards

## 2. Verification

- [x] 2.1 Verify mobile layout is unchanged (cards stacked, `max-w-lg`)
- [x] 2.2 Verify desktop layout at `lg:` breakpoint shows cards side-by-side with `max-w-4xl`
- [x] 2.3 Verify cards size to their own content height (not stretching to match taller card)
- [x] 2.4 Verify Start Game button spans full width below both cards at all viewports
