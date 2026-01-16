# Research: Cryptogram Mapping Table Visual Redesign

**Date**: 2026-01-13
**Feature**: [spec.md](./spec.md)

## Research Scope

This is a straightforward UI redesign with no unknowns requiring external research. The technical stack (React, TypeScript, Tailwind CSS) is well-established in the project.

## Design Decisions

### Decision 1: Flexbox Layout with Inverted Colors

**Decision**: Use Flexbox with fixed-width cells (80px) and white gaps acting as visual borders

**Rationale**:

- SSR-compatible (no JavaScript required, pure CSS)
- Avoids border doubling issues that plague HTML tables and traditional borders
- Inverted color approach: light gray cells (`bg-gray-50`) with white gaps (`gap-2`) creates clean separation
- True responsiveness: column count naturally adapts to screen width (3-14 columns)
- Fixed-width cells prevent last row from appearing disproportionate
- White gaps blend seamlessly with page background

**Alternatives Considered**:

- HTML table with border-collapse → Rejected: Border doubling at cell intersections looked unprofessional
- Flexbox with actual borders → Rejected: Same border doubling issues as tables
- Flexbox with gap-px + gray background → Rejected: Gray background looked "awful" (user feedback)
- CSS Grid → Rejected: Less flexible for truly responsive column counts

### Decision 2: Visual Styling - Inverted Color Approach

**Decision**: Light gray cells (`bg-gray-50`) with white gaps (`gap-2` = 8px) serving as borders

**Rationale**:

- Inverted approach avoids border doubling completely (gaps don't collapse like borders)
- Light gray cells provide subtle distinction from white page background
- White gaps blend with page, creating clean appearance
- `gap-2` (8px) provides clear visual separation without being heavy-handed
- No zebra striping needed - uniform gray provides sufficient distinction
- Tailwind-only solution (Principle VI compliance)

**Alternatives Considered**:

- Zebra striping with alternating rows → Rejected: Complicated responsive design, removed for simplicity
- Darker cell colors → Rejected: Would create too much visual weight
- Smaller gaps (gap-1/4px, gap-1.5/6px) → Rejected: User preferred thicker 8px gaps
- Gray background with white cells → Rejected: Created "awful" gray blocks between cells

### Decision 3: Responsive Layout

**Decision**: Flexbox with `flex-wrap` and fixed 80px cell width, naturally adapting column count

**Rationale**:

- Natural responsiveness without JavaScript or breakpoints
- Column count adapts automatically based on screen width:
  - 320px mobile: ~3 cells per row
  - 768px tablet: 8 cells per row
  - 1920px ultra-wide: 14 cells per row
- Fixed 80px width prevents last row (V-Z, 5 letters) from appearing disproportionately large
- Left-aligned layout (`justify-start`) provides conventional appearance
- Touch targets remain usable across all screen sizes

**Alternatives Considered**:

- Fixed column count with breakpoints → Rejected: Less flexible, requires maintenance
- Dynamic JavaScript for row grouping → Rejected: Not SSR-compatible, unnecessary complexity
- Center-aligned layout → Rejected: Left alignment more conventional (user preference)

### Decision 4: Input Cell Design

**Decision**: Maintain existing input size (40x40px) and styling, only change container structure to Flexbox

**Rationale**:

- Existing inputs are working well (40x40px boxes with proper touch targets)
- Only the container structure changed (div grid → Flexbox with fixed-width wrappers)
- Minimizes risk of breaking existing functionality
- Conflict highlighting logic remains unchanged
- Input styling independent of container layout approach

**Alternatives Considered**:

- Redesign inputs entirely → Rejected: Scope creep, user wants functionality unchanged
- Reduce input size for more columns → Rejected: May hurt mobile usability

## Technical Approach

### Implementation Strategy

1. Replace the grid container with Flexbox layout:

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

2. Apply inverted color approach:

   - Light gray cells: `bg-gray-50`
   - White gaps: `gap-2` (8px)
   - Fixed width: `w-20` (80px)

3. Key Tailwind classes:

   - `flex flex-wrap` - Responsive wrapping
   - `justify-start` - Left alignment
   - `gap-2` - 8px white gaps acting as borders
   - `w-20` - Fixed 80px cell width

4. Keep existing logic:
   - Conflict detection (`getConflictingLetters`)
   - Input change handlers
   - Clear all functionality
   - Disabled states

### Testing Strategy

**E2E Tests** (Primary):

- Existing Cypress tests verified functionality maintained (34/34 passing)
- Visual verification using Chrome DevTools MCP at multiple widths (320px, 768px, 1920px)
- Manual testing confirmed responsive behavior and touch targets

**Manual Verification**:

- Tested on 320px, 375px, 768px, 1920px viewports
- Verified conflict highlighting works
- Verified Clear All button functionality
- Verified disabled states (1000+ character puzzle input)

### Risk Assessment

**Low Risk**:

- No business logic changes
- No data model changes
- No API changes
- UI-only transformation

**Resolved Issues**:

- Border doubling → Solved with gap-based approach (gaps don't collapse)
- SSR compatibility → Pure CSS solution, no JavaScript required
- Last row sizing → Fixed with w-20 constraint on all cells
- Visual weight → Light gray cells with white gaps blend naturally with page

## Research Conclusion

No external research required. All technical decisions can be made using existing project patterns and well-established web standards. Ready to proceed with implementation.
