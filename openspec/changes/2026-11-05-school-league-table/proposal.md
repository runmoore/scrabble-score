## Why

A spec for an interactive school attainment league table was prototyped elsewhere and should be built into this app as a standalone utility page, in the same spirit as the existing `anagram` and `cryptogram` pages — a self-contained tool unrelated to the games/players data model, reachable only by direct URL. The source spec (external to this repo) covers product behaviour in full; this change adapts it into the repo's technical conventions (routing, data loading, testing, URL state) and the decisions made to resolve the ambiguities the source spec deliberately left open (it explicitly does not prescribe tech stack or UI copy).

## What Changes

- Add a new public route `/school-league-table` rendering a sortable, filterable table of 93 Scottish primary school attainment records (91 schools + 2 benchmark rows) across 5 school years, with a derived 5-year-average column
- Add per-row favouriting (star toggle), with no persistence beyond the URL
- Add a comparison line chart (via Recharts) plotting favourited rows' per-year scores, with a legend and hover-to-emphasize-one-line interaction
- Persist filters, sort, search text, and favourites entirely in the URL query string, restored on load with no flash of default state, and without creating a new browser-history entry per keystroke/click
- Add a static dataset file and a thin server model module to load it

## Capabilities

### New Capabilities

- `school-league-table`: A standalone page at `/school-league-table` with a sortable/filterable table, derived 5yr-avg column, favouriting, a favourites-driven comparison chart, and full URL-based state persistence (no auth, no DB, no nav entry).

## Impact

- New files:
  - `app/data/school-league-table.json` — static 93-record dataset
  - `app/models/school-league-table.server.ts` — `getSchoolLeagueTableData()` loader helper
  - `app/utils/school-league-table.ts` — pure helpers: URL-state parse/serialize, sort comparator, filter logic
  - `app/routes/school-league-table.tsx` — the route (loader + component)
  - Co-located Vitest tests for the pure helpers (max 5 test cases)
  - `cypress/e2e/school-league-table.cy.ts` — one smoke-test scenario
- New dependency: `recharts`
- No changes to existing routes, models, or navigation
- No database schema changes
