# Implementation Plan: Cryptogram Mapping Table Visual Redesign

**Branch**: `003-mapping-table-redesign` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-mapping-table-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Redesign the cryptogram page's letter mapping table (MappingGrid component) from a box-based grid layout to a Flexbox layout with fixed-width cells and inverted color styling. The implementation uses light gray cells (`bg-gray-50`) with white gaps (`gap-2`) acting as visual borders to provide clear visual distinction from the inline mapping inputs above while maintaining all existing functionality. The design is fully SSR-compatible and naturally responsive across all screen sizes.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18
**Primary Dependencies**: Remix 2.12.1 (Indie Stack), Tailwind CSS
**Storage**: N/A (UI-only change, no data model changes)
**Testing**: Vitest (unit tests), Cypress (e2e tests)
**Target Platform**: Progressive Web App (PWA) - iPhone as primary target
**Project Type**: Web application (Remix full-stack)
**Performance Goals**: Standard web responsiveness (no specific metrics required for UI redesign)
**Constraints**: Must work across mobile (320px+), tablet, and desktop; maintain existing functionality
**Scale/Scope**: Single component redesign (MappingGrid in `app/routes/cryptogram.tsx` lines 273-345)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Pre-Research)

### Principle I: Test-First Development

- ✅ **Status**: PASS
- **Plan**: Existing Cypress e2e tests for cryptogram page will verify visual changes maintain functionality. Unit tests for MappingGrid component will be updated if needed.

### Principle II: Code Quality Gates

- ✅ **Status**: PASS
- **Plan**: Will run `npm run lint`, `npm run typecheck`, and `npm run format` after changes.

### Principle III: Type Safety First

- ✅ **Status**: PASS
- **Plan**: No type changes required - maintaining existing props interface for MappingGrid component.

### Principle IV: Server-Side Security

- ✅ **Status**: N/A
- **Plan**: UI-only change, no server-side operations.

### Principle V: Progressive Enhancement

- ✅ **Status**: PASS
- **Plan**: Flexbox layout uses standard CSS that works without JavaScript. Pure SSR-compatible styling solution.

### Principle VI: PWA-First Mobile Design

- ✅ **Status**: PASS
- **Plan**: Mobile-first table design using Tailwind CSS utilities. Will test on iPhone viewport (375px minimum).

### Principle VII: Database Schema Integrity

- ✅ **Status**: N/A
- **Plan**: No database changes.

### Principle VIII: Avoid Premature Abstraction

- ✅ **Status**: PASS
- **Plan**: Simple component redesign - no new utility functions or abstractions needed. Direct inline Flexbox with Tailwind utilities.

### Post-Design Re-check

**All principles remain PASS**. Design phase confirmed:

- No new abstractions introduced (direct Flexbox mapping)
- Tailwind utilities used exclusively (no custom CSS classes)
- Pure CSS solution (SSR-compatible, progressive enhancement)
- Existing test infrastructure sufficient
- Component props interface unchanged (type safety maintained)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
└── routes/
    └── cryptogram.tsx        # Contains MappingGrid component to be redesigned

cypress/
└── e2e/
    └── cryptogram.spec.ts    # E2E tests to verify functionality maintained
```

**Structure Decision**: Remix Indie Stack with file-based routing. This is a single-component redesign within the existing `cryptogram.tsx` route file. No new files or directories needed.

## Complexity Tracking

No constitution violations. This is a simple UI redesign that follows all established principles.

---

## Phase Completion Summary

### Phase 0: Research ✅

- **Output**: [research.md](./research.md)
- **Key Decisions**:
  - Flexbox layout with fixed-width cells (80px)
  - Inverted color approach: light gray cells (`bg-gray-50`) with white gaps (`gap-2`)
  - Naturally responsive column count (3-14 columns depending on screen width)
  - Maintain existing input styling and conflict logic
  - Pure CSS solution (SSR-compatible, no JavaScript)
- **Status**: Complete - No unknowns remain

### Phase 1: Design & Contracts ✅

- **Outputs**:
  - [data-model.md](./data-model.md) - No data model changes (UI-only)
  - [contracts/README.md](./contracts/README.md) - No API contracts (client-side only)
  - [quickstart.md](./quickstart.md) - Implementation guide
  - Agent context updated in CLAUDE.md
- **Key Artifacts**:
  - Component props interface unchanged
  - Single file modification: `app/routes/cryptogram.tsx`
  - Existing test infrastructure sufficient
- **Status**: Complete - Ready for task breakdown

### Next Steps

**Command**: `/speckit.tasks`

This will generate `tasks.md` with the detailed implementation checklist based on the design artifacts created in this plan.
