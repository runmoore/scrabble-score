## 1. Data and model

- [x] 1.1 Add `app/data/school-league-table.json` with the full 93-record dataset from the source spec, verbatim
- [x] 1.2 Add `app/models/school-league-table.server.ts` exporting `getSchoolLeagueTableData()`, which imports the JSON and returns each record augmented with a computed `fiveYearAvg` field
- [x] 1.3 Add `computeFiveYearAverage(scores)` as an exported pure function (mean of non-null year values, excluded from count when null, rounded to 1 decimal, `null` if no non-null years)

## 2. URL state and table logic utilities

- [x] 2.1 Add `app/utils/school-league-table.ts` defining the `TableState` type (`sortKey`, `sortDir`, `rcOnly`, `favOnly`, `search`, `favouriteIds`) and its defaults
- [x] 2.2 Implement `parseTableState(searchParams: URLSearchParams): TableState`, reading `sort`, `dir`, `rc`, `favOnly`, `q`, `favs`, falling back to defaults for absent params
- [x] 2.3 Implement `serializeTableState(state: TableState): URLSearchParams`, omitting any field equal to its default (default state serializes to empty params)
- [x] 2.4 Implement `sortRows(rows, state)`: comparator for School Name (string), year columns and 5yr Avg (numeric), with `null`/missing values always sorted to the bottom regardless of direction
- [x] 2.5 Implement `filterRows(rows, state)`: AND-combination of RC-only, favourites-only, and case-insensitive substring search on `school_name`
- [x] 2.6 Implement a chart color helper: given an ordered list of favourited rows (by ascending `id`), return a stable color per row cycling through the 5 brand `-primary` colors then 6 extended Tailwind-default primaries

## 3. Route: table, filters, sorting, favourites

- [x] 3.1 Create `app/routes/school-league-table.tsx` with a `loader` calling `getSchoolLeagueTableData()` and returning it via `json()`; no `requireUserId()` call
- [x] 3.2 Render the table: favourite-star column, School Name (+ RC badge where applicable), year columns, 5yr Avg column; missing values render as "—"
- [x] 3.3 Apply a distinct row background for the two benchmark rows (`"Scotland all funded"`, `"All publicly funded schools"`)
- [x] 3.4 Derive displayed rows via `parseTableState(searchParams)` → `filterRows` → `sortRows`, computed synchronously during render (not in an effect)
- [x] 3.5 Render clickable, sortable column headers with a visual indicator (e.g. arrow) for the active sort column/direction; clicking the active column reverses direction, clicking another column switches to it with the correct default direction
- [x] 3.6 Render the "Showing X of Y rows" count, reflecting only the active filters
- [x] 3.7 Render the RC-only and Favourites-only toggles, and the search input
- [x] 3.8 Render the star toggle per row (filled/outline based on favourite membership), independent of sort/filter position
- [x] 3.9 Wire every interaction (header click, toggle click, search input, star click) through `setSearchParams(updater, { replace: true })`, updating only the relevant param(s) and removing params that return to their default value

## 4. Comparison chart

- [x] 4.1 Add `recharts` as a dependency
- [x] 4.2 Build the chart section beneath the table, always present
- [x] 4.3 Compute the plotted series from the full (unfiltered) row set restricted to currently favourited `id`s — independent of table filters
- [x] 4.4 Render one `<Line dataKey="{year}" connectNulls={false}>` per favourited row, keyed/colored via the stable color helper (2.6)
- [x] 4.5 Compute and apply the Y-axis `domain`: `[max(0, min - padding), min(100, max + padding)]` over plotted values, `padding = max(5, (max - min) * 0.1)`
- [x] 4.6 Render a custom legend listing each favourited school's name with its line color
- [x] 4.7 Track hovered favourite in component state via legend `onMouseEnter`/`onMouseLeave`; apply muted opacity to non-hovered lines and bring the hovered line's `<Line>` to the end of the render order
- [x] 4.8 Render an empty-state message in the chart area when there are zero favourites

## 5. Tests (capped at 5 Vitest cases + 1 Cypress scenario)

- [x] 5.1 Vitest: `computeFiveYearAverage` excludes nulls from both sum and count (not treated as zero)
- [x] 5.2 Vitest: `sortRows` places `null`/missing values at the bottom regardless of ascending/descending direction
- [x] 5.3 Vitest: `filterRows` AND-combines RC-only, favourites-only, and search correctly
- [x] 5.4 Vitest: `parseTableState` returns correct defaults for an empty `URLSearchParams` and correct values when params are present
- [x] 5.5 Vitest: `serializeTableState` round-trips with `parseTableState` and omits default-valued params
- [x] 5.6 Cypress: one `it()` in `cypress/e2e/school-league-table.cy.ts` covering: sort a column, toggle a filter, favourite a row (chart appears with its line/legend), reload the resulting URL and confirm the same state (filters, sort, favourites, chart) is restored with no flash of default state

## 6. Verification

- [x] 6.1 Run `npm run typecheck` — no type errors
- [x] 6.2 Run `npm run lint` — no lint errors
- [x] 6.3 Run `npm test -- --run` — all tests pass
- [x] 6.4 Run `npm run test:e2e:run` — Cypress spec passes
- [x] 6.5 Manual check: load `/school-league-table` with a URL carrying sort/filter/favourite params and confirm no flash of default state before the restored state renders
