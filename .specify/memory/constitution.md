<!--
Sync Impact Report
==================
Version change: 1.1.1 → 1.2.0
Constitution amendment date: 2026-01-07
Modified principles: None
Added sections:
  - Principle VIII: Avoid Premature Abstraction (NEW)
  - Pre-Implementation Checklist: Added abstraction justification item
Renumbered sections:
  - Previous Principle VII (Database Schema Integrity) remains Principle VII (no renumber needed, new principle added at end)
Removed sections: None
Templates requiring updates:
  - plan-template.md - Should document abstraction decisions in technical context
  - tasks-template.md - Tasks should prefer inline code unless abstraction justified
Follow-up TODOs: None
Rationale: Premature abstraction creates unnecessary complexity and indirection. Simple, inline code is easier to understand and maintain than trivial wrapper functions. Abstractions should only be introduced when there is clear evidence of reuse, complexity reduction, or encapsulation of business logic.

Previous Amendment
==================
Version change: 1.1.0 → 1.1.1
Constitution amendment date: 2026-01-06
Modified principles:
  - Principle VI: PWA-First Mobile Design - Added Tailwind CSS styling guideline
Added sections: None
Renumbered sections: None
Removed sections: None
Templates requiring updates: None (styling guideline is a clarification)
Follow-up TODOs: None
Rationale: Clarifies that Tailwind CSS should be used for all styling instead of inline style attributes, ensuring consistent and maintainable styling patterns across the application.

Previous Amendment
==================
Version change: 1.0.0 → 1.1.0
Constitution amendment date: 2026-01-06
Modified principles:
  - Principle V: Progressive Enhancement - Added PWA considerations
Added sections:
  - Principle VI: PWA-First Mobile Design (NEW)
  - Pre-Implementation Checklist: Added PWA compatibility item
Renumbered sections:
  - Previous Principle VI (Database Schema Integrity) → Principle VII
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md - Should reference PWA requirements
  ✅ spec-template.md - Mobile/PWA considerations in UI sections
  ✅ tasks-template.md - PWA testing tasks
Follow-up TODOs: None
Rationale: Application is a PWA optimized for iPhone. This principle was implicit but needed to be explicit to ensure all features maintain mobile-first PWA compatibility.
-->

# Scrabble Score Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

All code changes MUST follow the established testing architecture:

- **Unit tests** co-located with implementation files using Vitest and Testing Library
- **E2E tests** in `cypress/e2e/` for user workflows
- **Custom commands** in `cypress/support/commands.ts` for reusable test patterns
- Tests MUST pass before code is considered complete
- Test cleanup (e.g., `cy.cleanupUser()`) MUST be implemented to maintain test isolation

**Rationale**: The project has a mature testing infrastructure that ensures reliability and prevents regressions. This is enforced through CI/CD gates.

### II. Code Quality Gates

Before ANY code change is considered complete, the following commands MUST run successfully in sequence:

1. `npm run lint` - ESLint verification
2. `npm run typecheck` - TypeScript type safety
3. `npm run format` - Prettier formatting

**Rationale**: These gates are explicitly documented in CLAUDE.md as non-negotiable requirements. Consistent code quality prevents technical debt and integration issues.

### III. Type Safety First

TypeScript MUST be used throughout the codebase:

- All functions, components, and modules MUST have explicit types
- Prisma types MUST be re-exported from `*.server.ts` files for reuse
- Type augmentation (e.g., `EnhancedGame`) MUST be used when extending base types
- `any` type is prohibited except when interfacing with truly dynamic third-party APIs

**Rationale**: Type safety catches errors at compile time, improves developer experience through autocomplete, and serves as living documentation.

### IV. Server-Side Security

All server-side operations MUST enforce authorization:

- Files ending in `.server.ts` contain server-only code
- Database queries MUST include `userId` filtering to prevent unauthorized access
- Session management via `session.server.ts` helpers (`requireUserId()`, `getUser()`)
- Authentication MUST be enforced before accessing protected resources

**Rationale**: Multi-tenant data isolation is critical for user privacy and security. The established patterns prevent data leakage between users.

### V. Progressive Enhancement

User interfaces MUST work without JavaScript:

- Use Remix `Form` component and `action` functions
- Forms MUST submit and function without client-side JavaScript
- Enhance with JavaScript for better UX (e.g., optimistic UI)
- Mobile considerations (e.g., `inputMode="numeric"` with +/- buttons for iOS)

**Rationale**: Progressive enhancement ensures accessibility, resilience to network issues, and broader device compatibility.

### VI. PWA-First Mobile Design

All features MUST be optimized for Progressive Web App usage on mobile devices:

- Mobile-first responsive design with iPhone as primary target
- Touch-friendly UI elements (minimum 44x44pt touch targets)
- **Tailwind CSS for all styling**: Use Tailwind utility classes instead of inline `style` attributes wherever possible. Only use inline styles when absolutely necessary (e.g., dynamic values that can't be predetermined)
- PWA manifest configuration for home screen installation
- Apple-specific meta tags for optimal iOS experience (`apple-mobile-web-app-capable`, `apple-touch-icon`)
- Features MUST work when installed as PWA on iPhone home screen
- Test on mobile viewports (375px width minimum)

**Rationale**: The application is designed as a PWA for mobile-first usage, particularly iPhone devices. All features must provide a native-like experience when installed on the home screen. Tailwind ensures consistent, maintainable styling across the application.

### VII. Database Schema Integrity

Database changes MUST follow Prisma conventions:

- Schema changes via `npx prisma migrate dev`
- Migrations MUST be committed to version control
- Seed data MUST be maintained in sync with schema
- Cascade deletes MUST be explicitly defined for dependent relationships

**Rationale**: Prisma migrations provide auditable schema history and prevent drift between environments.

### VIII. Avoid Premature Abstraction

Code MUST favor simplicity and directness over unnecessary abstraction:

- **Default to inline code**: Keep related logic together in the same file unless there's clear justification for extraction
- **Abstractions require evidence**: Only create separate utility functions/modules when there is:
  - **Genuine reuse**: Used in 3+ different locations across the codebase
  - **Complexity reduction**: The abstraction meaningfully simplifies the calling code (not just wrapping a single API call)
  - **Business logic encapsulation**: Contains domain-specific logic that benefits from centralization
- **Avoid trivial wrappers**: Do not create utility functions that simply wrap a single built-in API call (e.g., `encodePuzzleForUrl(text)` that only calls `encodeURIComponent(text)`)
- **Inline is clearer**: Simple operations like `encodeURIComponent()` or `array.filter()` are more readable when used directly
- **DRY is not absolute**: "Don't Repeat Yourself" should not override clarity - some repetition is acceptable if it keeps code self-contained and understandable

**Rationale**: Premature abstraction creates unnecessary indirection, cognitive overhead, and maintenance burden. Simple, inline code that uses standard APIs directly is easier to understand, debug, and modify. Abstractions should solve real problems (reuse, complexity, encapsulation), not theoretical ones.

## Quality Gates

### Pre-Implementation Checklist

Before starting any feature:

- [ ] User scenarios defined with acceptance criteria
- [ ] Data model changes identified (if applicable)
- [ ] Testing strategy outlined (unit vs. e2e)
- [ ] Mobile/iOS considerations documented (if UI changes)
- [ ] PWA compatibility verified (works on iPhone home screen)
- [ ] Abstractions justified (if creating utility functions/modules, document why inline code insufficient)

### Pre-Commit Checklist

Before committing code:

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run format` applied
- [ ] Tests written and passing (`npm test` and/or `npm run test:e2e:run`)
- [ ] Server-side authorization checks in place
- [ ] Progressive enhancement verified (forms work without JS)

### Pre-Deploy Checklist

Before deploying to production:

- [ ] `npm run validate` passes (runs all tests, lint, typecheck, e2e)
- [ ] GitHub Actions CI passes all jobs
- [ ] Database migrations applied to target environment
- [ ] Environment secrets verified (SESSION_SECRET, etc.)

## Testing Architecture

### Unit Testing (Vitest)

- **Location**: Co-located `*.test.ts` files next to implementation
- **Tools**: Vitest, @testing-library/react, @testing-library/jest-dom
- **Coverage**: Components, utilities, business logic
- **Command**: `npm test` (watch mode) or `npm run test -- --run`

### E2E Testing (Cypress)

- **Location**: `cypress/e2e/`
- **Custom Commands**: `cypress/support/commands.ts`
  - `cy.login()` - Test user authentication
  - `cy.createGameWithPlayers(players)` - Game setup flow
  - `cy.submitScore(score)` - Score submission with navigation wait
  - `cy.togglePlusScoreSign()` / `cy.toggleNegativeScoreSign()`
  - `cy.checkButtonStates(minusEnabled, plusEnabled)`
- **Cleanup**: `cy.cleanupUser()` in `afterEach()` blocks
- **Command**: `npm run test:e2e:dev` (interactive) or `npm run test:e2e:run` (headless)

### Integration Testing (MSW)

- **Location**: `mocks/` directory
- **Purpose**: API mocking for development and testing
- **Usage**: Automatically enabled with `npm run dev` and `npm run start:mocks`

## Governance

### Amendment Process

1. Propose amendment with rationale and impact analysis
2. Update this constitution with version bump following semantic versioning
3. Update dependent templates (plan-template.md, spec-template.md, tasks-template.md)
4. Document changes in Sync Impact Report (HTML comment at top of file)
5. Update CLAUDE.md if runtime guidance changes

### Versioning Policy

- **MAJOR**: Backward incompatible changes (e.g., removing a principle, changing testing requirements)
- **MINOR**: New principles added or existing principles materially expanded
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

All pull requests MUST verify compliance with:

- Core Principles (I-VIII)
- Quality Gates (Pre-Commit Checklist minimum)
- Testing Architecture requirements

CI/CD pipeline automatically enforces: lint → typecheck → vitest → cypress → deploy

### Exception Handling

Exceptions to these principles MUST be:

1. Documented in the feature's `plan.md` under "Complexity Tracking"
2. Justified with specific rationale
3. Include explanation of why simpler alternatives were rejected
4. Approved in code review with explicit acknowledgment

**Version**: 1.2.0 | **Ratified**: 2025-12-05 | **Last Amended**: 2026-01-07
