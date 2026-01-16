# Quick Start: Cryptogram Mapping Table Visual Redesign

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

Simple visual redesign to convert the letter mapping grid from a box-based layout to a Flexbox layout with inverted colors (light gray cells with white gaps acting as borders).

## Files to Modify

**Single file**: `app/routes/cryptogram.tsx`

**Component**: `MappingGrid` (lines 273-345)

## Implementation Steps

### 1. Update MappingGrid Component Structure

**Current Structure** (div grid):

```tsx
<div className="grid grid-cols-6 gap-1 md:grid-cols-9 lg:grid-cols-13">
  {alphabet.map((letter) => (
    <div key={letter} className="flex flex-col items-center">
      <label>...</label>
      <input>...</input>
    </div>
  ))}
</div>
```

**New Structure** (Flexbox with inverted colors):

```tsx
<div className="mx-auto flex max-w-7xl flex-wrap justify-start gap-2">
  {alphabet.map((letter) => (
    <div key={letter} className="w-20 bg-gray-50 p-2 text-center">
      <label>...</label>
      <input>...</input>
    </div>
  ))}
</div>
```

### 2. Key Styling Changes

**Container**:

- `flex flex-wrap` - Enable flexible wrapping
- `justify-start` - Left-align cells (conventional layout)
- `gap-2` - 8px white gaps acting as visual borders
- `max-w-7xl mx-auto` - Constrain width and center container

**Cells**:

- `w-20` - Fixed 80px width (prevents last row from appearing disproportionate)
- `bg-gray-50` - Light gray background for distinction
- `p-2` - Padding for touch targets
- `text-center` - Center content

**Responsive Behavior**:

- No breakpoints needed - column count adapts naturally
- 320px mobile: ~3 cells per row
- 768px tablet: 8 cells per row
- 1920px ultra-wide: 14 cells per row

### 3. Inputs Remain Unchanged

**Inputs**:

- Keep existing classes unchanged
- Maintain conflict highlighting logic (`border-red-primary` when conflicts detected)
- All existing functionality preserved (conflict detection, clear all, disabled states)

### 4. Testing

**Run existing tests**:

```bash
npm run test:e2e:run  # Verify functionality maintained
npm run typecheck     # Verify no type errors
npm run lint          # Verify code quality
npm run format        # Apply consistent formatting
```

**Manual testing**:

- Open `/cryptogram` in browser
- Test on mobile viewport (375px, 320px)
- Verify:
  - Container has light gray cells with white gaps between them
  - Gaps provide clear visual separation (8px white space)
  - Layout wraps naturally at different screen widths
  - Inputs accept letter entry
  - Conflict highlighting works (enter same letter for multiple cipher letters)
  - Clear All button works
  - Disabled state works (enter 1000+ characters in puzzle input)

## Expected Outcome

The letter mapping section will look distinctly different from the inline inputs above:

- ✅ Flexbox layout with fixed-width cells
- ✅ Light gray cells (`bg-gray-50`) with white gaps (`gap-2`)
- ✅ Clean, organized appearance with clear visual separation
- ✅ Naturally responsive layout across all devices (3-14 columns)
- ✅ SSR-compatible (pure CSS, no JavaScript)
- ✅ All functionality preserved

## Risk Mitigation

**Low risk change**:

- No business logic changes
- No data model changes
- Only HTML/CSS structure

**Potential issues**:

- Flexbox wrapping behavior may vary slightly across browsers → Mitigated by using standard CSS properties
- Visual appearance tested across multiple viewports (320px, 768px, 1920px)

## Time Estimate

**Development**: 1-2 hours
**Testing**: 30 minutes
**Total**: 2-2.5 hours
