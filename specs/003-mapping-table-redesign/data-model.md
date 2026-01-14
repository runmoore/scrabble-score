# Data Model: Cryptogram Mapping Table Visual Redesign

**Date**: 2026-01-13
**Feature**: [spec.md](./spec.md)

## Summary

No data model changes required. This is a pure UI redesign that does not affect:

- Database schema
- Data structures
- API payloads
- State management

## Existing Data Structures (Unchanged)

The MappingGrid component uses existing state structures that remain identical:

### `mappings` State

```typescript
Record<string, string>
```

- Maps cipher letters (A-Z) to plain letters
- Example: `{ "A": "Q", "B": "W", "C": "E", ... }`
- Managed by parent component's React useState
- No changes to this structure

### Component Props (Unchanged)

```typescript
interface MappingGridProps {
  mappings: Record<string, string>;
  onMappingChange: (cipher: string, plain: string) => void;
  onClearAll: () => void;
  disabled: boolean;
}
```

## Visual-Only Changes

The redesign affects only the **presentation layer**:

- HTML structure: `div` grid → `table` element
- CSS classes: Tailwind utilities for table styling
- Layout: Grid layout → table rows/columns

All data flows, state management, and business logic remain unchanged.
