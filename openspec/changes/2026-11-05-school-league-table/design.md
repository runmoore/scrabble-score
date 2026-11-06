## Context

The source spec (`school-league-table-spec.md`, prototyped in a separate repo) fully defines product behaviour — table columns, sort/filter semantics, the 5yr-avg derivation, favouriting, the comparison chart, and URL state persistence — but explicitly leaves all technology choices to the implementer. This document records those choices, made in alignment with the repo owner, for a Remix Indie Stack codebase that otherwise has no charting library and no existing favourite/star component to extend.

This is a standalone utility page, not part of the games/players domain. It follows the precedent of `app/routes/anagram.tsx` and `app/routes/cryptogram.tsx`: public (no auth), no nav-menu entry, reachable only via direct URL.

## Goals / Non-Goals

**Goals:**

- Faithfully implement every behaviour in the source spec's §3 (Functional Requirements) and §4 (Known, Accepted Behaviours)
- Keep the implementation idiomatic to this repo's existing Remix conventions (loader-provided data, `useSearchParams`-driven URL state, co-located tests)
- No flash of default state on load, even with URL params present
- No new browser-history entry per keystroke or click while interacting with filters/sort/search/favourites

**Non-Goals (per source spec §5, reaffirmed here):**

- Supporting any dataset other than the fixed 93-record one
- Any persistence beyond the URL (no accounts, no device-local storage, no server-side state)
- Pagination, virtualization, accessibility compliance, or responsive/mobile layout
- Adding a navigation entry anywhere in the app for this page

## Decisions

**Data loading**: The dataset lives in `app/data/school-league-table.json`, loaded server-side via `getSchoolLeagueTableData()` in `app/models/school-league-table.server.ts`, called from the route's `loader`. This function also augments each record with a pre-computed `fiveYearAvg` field (see below), returned to the client via `json()`.

_Rationale_: Matches the repo's `.server.ts` model convention (e.g. `game.server.ts`) even though there's no real query logic — gives one place to own the 5yr-avg derivation, and keeps it testable without Remix request/response machinery.

**5-year average**: Computed once per record as the mean of non-null year scores, rounded to 1 decimal place; `null` if no year has data. Computed server-side in the model function rather than per-render in the component.

_Rationale_: Cheap either way for 93 rows, but computing it once alongside the data load keeps the component focused on display/interaction logic, and gives a single, directly unit-testable function (`computeFiveYearAverage`).

**URL state**: A single pure module, `app/utils/school-league-table.ts`, owns:
- `parseTableState(searchParams)` → `{ sortKey, sortDir, rcOnly, favOnly, search, favouriteIds }`, applying defaults (`sortKey: "school_name"`, `sortDir: "asc"`, all filters off, empty search, empty favourite set) when params are absent
- `serializeTableState(state)` → a `URLSearchParams`, omitting any field that equals its default, so the default state serializes to no params at all
- `sortRows(rows, state)` — comparator with null-sorts-to-bottom regardless of direction
- `filterRows(rows, state)` — AND-combination of the three filters

Param names: `sort` (column key: `school_name`, `fiveYearAvg`, or a literal year label like `2020/21`), `dir` (`asc`|`desc`), `rc` (`1` when on, absent when off), `favOnly` (`1`when on, absent when off), `q` (search text), `favs` (the favourited set, as a **repeated param** — one `favs=<id>` entry per favourite, e.g. `favs=2&favs=5&favs=44` — rather than a single comma-delimited value).

_Rationale (favs encoding)_: `URLSearchParams` supports repeated keys natively (`getAll("favs")` / `append("favs", id)`), so each id stays a distinct, individually-encoded query value instead of being packed into one delimited string. This keeps the URL's structure explicit and avoids a second, ad-hoc delimiter (`,`) nested inside a query string that already uses `&`/`=` as its delimiters.

The route component derives `parseTableState(searchParams)` synchronously during render (the search params are already correct on the server-rendered first paint), never in a `useEffect`, so there is no flash of default state before the restored state appears.

Every interaction (sort-header click, filter toggle, search `onChange`, favourite-star click) updates the URL via `setSearchParams(updater, { replace: true })` (the functional-updater form already used in `anagram.tsx`/`compare.$playerOne.$playerTwo.tsx`, with the `replace` option added). Because every update replaces the current history entry rather than pushing a new one, no debounce is needed to satisfy the "no history entry per keystroke" requirement — simplicity over a timed debounce.

_Rationale_: Centralizing parse/serialize/sort/filter in one pure module makes them independently unit-testable and keeps the route component itself mostly declarative JSX.

**Favourite color assignment (chart)**: Colors are assigned by iterating favourited rows in ascending `id` order (the dataset's fixed order), not by current table sort/filter order, cycling through: the 5 brand `-primary` colors (`green`, `blue`, `red`, `yellow`, `purple`, from `tailwind.config.js`) first, then 6 extended Tailwind-default primaries (`emerald-600`, `indigo-600`, `rose-600`, `amber-600`, `cyan-600`, `violet-600`), repeating the full 11-color list if exhausted.

_Rationale_: Keeps a given school's line color stable regardless of how the table is currently sorted/filtered (the chart is explicitly independent of table filters per source spec §3.3) and avoids colors visibly reshuffling as the user sorts the table.

**Chart (Recharts)**:
- `<LineChart>` with one `<Line dataKey="{year}" connectNulls={false}>` per favourited row — `connectNulls={false}` gives the required visual gap across missing years for free
- Y-axis `domain` computed as `[max(0, min - padding), min(100, max + padding)]` over all plotted (non-null) values, where `padding = max(5, (max - min) * 0.1)`; if `max === min` (all favourited values identical), padding still applies so the single value isn't flush against both edges
- Custom `<Legend>` listing favourited school names; `onMouseEnter`/`onMouseLeave` on each legend item sets/clears a `hoveredId` state value
- Each `<Line>` reads `strokeOpacity`/`strokeWidth` derived from `hoveredId` (full opacity + thicker stroke for the hovered line, muted opacity for others, unchanged when `hoveredId` is `null`); the favourited-rows array is reordered so the hovered line's `<Line>` is rendered last (SVG paint order = z-order) to bring it to the front
- Zero favourites renders an empty-state message in place of the chart

_Rationale_: Recharts' `connectNulls` and legend hover events map directly onto two of the spec's more fiddly requirements (gap rendering, line emphasis), avoiding hand-built SVG path/axis math for behaviour a mature library already provides declaratively.

**Auth / routing**: `app/routes/school-league-table.tsx` is a flat, unauthenticated route (no `requireUserId()` call), with no entry added to any navigation, matching `anagram.tsx`/`cryptogram.tsx`.

## Risks / Trade-offs

- [New dependency: `recharts`] → Accepted; no existing charting library in the repo, and the spec's line-chart-with-gaps-and-hover-emphasis requirements are a good fit for what the library provides out of the box.
- [Color list caps at 11 before repeating, but favourites are uncapped] → Accepted per source spec §4: identical-value lines (and now, beyond 11 favourites, same-colored lines too) are only disambiguated via legend hover; this is an explicitly accepted behaviour, not a bug.
- [5yr-avg computed server-side in the loader rather than client-side] → No real downside at this data volume (93 rows); keeps the value available without re-derivation anywhere sort/filter logic runs.
- [Test budget capped at 5 Vitest cases] → Covers the highest-risk pure logic (null handling in averaging/sorting, combined filters, URL parse/serialize); broader coverage (e.g. per-column sort exhaustively, every filter combination) is traded off against the agreed budget, backstopped by the one Cypress smoke scenario covering the main user-facing flow end-to-end.
