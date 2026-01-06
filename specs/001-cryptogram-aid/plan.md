# Implementation Plan: Cryptogram Solution Aid

**Branch**: `001-cryptogram-aid` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cryptogram-aid/spec.md`

## Summary

Implement a digital cryptogram solving aid that replaces pen-and-paper methods. Users input cryptograms and solve them using a mapping table/grid control panel (A-Z with input fields). The tool provides instant visual updates as mappings are entered, with an optional progressive hint system (frequency analysis and letter suggestions) hidden by default. No persistence required - single-session solving only.

## Technical Context

**Language/Version**: TypeScript 5.x (existing project stack)
**Primary Dependencies**: React 18, Remix 2.12.1 (Indie Stack), Tailwind CSS
**Storage**: N/A (session-only, no database persistence)
**Testing**: Vitest (unit tests), Cypress (e2e tests), @testing-library/react
**Target Platform**: Progressive Web App (PWA) for mobile browsers, specifically optimized for iPhone
**Project Type**: Web application (Remix full-stack)
**Performance Goals**: <100ms update latency for letter mappings, support up to 1000 character cryptograms
**Constraints**: Client-side state only (no server persistence), mobile-first UI design, PWA-compatible, Progressive Enhancement (works without JS)
**Scale/Scope**: Single-user, single-session tool; typical usage 100-500 character cryptograms, max 1000 characters

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **I. Test-First Development**
- Unit tests: Co-located tests for utility functions (frequency analysis, letter mapping logic)
- E2E tests: Cypress tests for user workflows (enter cryptogram, create mappings, request hints)
- Custom commands: Create `cy.enterCryptogram()`, `cy.createMapping()`, `cy.requestHints()` in `cypress/support/commands.ts`

✅ **II. Code Quality Gates**
- All code will pass `npm run lint`, `npm run typecheck`, `npm run format` before completion

✅ **III. Type Safety First**
- Explicit TypeScript types for: CryptogramState, LetterMapping, FrequencyData, HintSystemState
- No `any` types (all letter operations strongly typed)

✅ **IV. Server-Side Security**
- N/A - No database persistence, no user data stored
- Optional: If user authentication exists, can integrate with existing session management for user identification (not required for MVP)

✅ **V. Progressive Enhancement**
- Core functionality (puzzle display, mapping grid) works with basic HTML forms
- JavaScript enhancement adds instant updates and hint system interactions
- Mobile-first: Touch-friendly inputs, `inputMode="text"` for letter inputs
- PWA-compatible: Works as installable app on iPhone home screen

✅ **VI. PWA-First Mobile Design**
- Mobile-first responsive design with iPhone as primary target
- Touch-friendly UI elements (44x44pt minimum touch targets)
- Works when installed as PWA on iPhone home screen
- Tested on mobile viewports (375px width minimum)

✅ **VII. Database Schema Integrity**
- N/A - No database changes required (session-only state)

### Pre-Implementation Checklist

- [x] User scenarios defined with acceptance criteria (2 user stories in spec.md)
- [x] Data model changes identified (N/A - no database)
- [x] Testing strategy outlined (unit for utils, e2e for user workflows)
- [x] Mobile/iOS considerations documented (mobile-first design, PWA-compatible, touch-friendly, works on iPhone home screen)

### Evaluation

**Status**: ✅ PASS - All applicable principles satisfied. No database or server-side logic required simplifies implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-cryptogram-aid/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # Existing quality checklists
│   └── requirements.md
└── spec.md              # Feature specification
```

### Source Code (repository root)

This is a Remix web application with the existing Indie Stack structure. Following the existing convention (see `app/routes/anagram.tsx`), the cryptogram feature will be **self-contained in a single route file**:

```text
app/
├── routes/
│   ├── anagram.tsx           # Existing: Self-contained anagram solver
│   └── cryptogram.tsx        # New: Self-contained cryptogram solver
│       # Contains:
│       # - All React components (inline)
│       # - Helper functions (inline)
│       # - Type definitions (inline)
│       # - State management (React hooks)
├── models/                   # Existing: Database operations only
│   └── (no changes needed)
├── game-utils.ts             # Existing: Shared game logic
├── utils.ts                  # Existing: Generic utilities
└── session.server.ts         # Existing: Auth/session

app/routes/cryptogram.test.tsx    # Co-located route tests (new)
cypress/e2e/cryptogram.cy.ts      # E2E tests (new)
```

**Structure Decision**: Following existing repo pattern where features are self-contained in single route files (`anagram.tsx` pattern). All components, logic, types, and helpers will be defined inline within `app/routes/cryptogram.tsx`. No new directories or shared utilities needed - this keeps the feature isolated and maintainable without restructuring the entire app.

## Complexity Tracking

N/A - No constitution violations or complexity justifications needed. This is a straightforward client-side feature within established patterns.
