## ADDED Requirements

### Requirement: Standalone public route

The app SHALL render a school attainment league table at `/school-league-table`, requiring no authentication and with no link to it from any navigation element elsewhere in the app.

#### Scenario: Accessing the page directly

- **WHEN** any visitor (logged in or not) navigates to `/school-league-table`
- **THEN** the page SHALL render without redirecting to login

### Requirement: Table display

The page SHALL show one row per record in the fixed 93-record dataset (91 schools, 2 benchmark rows), always shown in full with no pagination, with columns: a favourite indicator, School Name, one column per school year present in the dataset (`2020/21`–`2024/25`), and a derived "5yr Avg" column.

#### Scenario: Roman Catholic badge

- **WHEN** a row's `isRomanCatholic` field is `true`
- **THEN** its School Name cell SHALL show an "RC" badge

#### Scenario: Benchmark row highlight

- **WHEN** a row's `school_name` is `"Scotland all funded"` or `"All publicly funded schools"`
- **THEN** that row SHALL render with a visually distinct background from both regular rows and the RC badge treatment
- **AND** the row SHALL otherwise sort, filter, search, count, and favourite exactly like any other row

#### Scenario: Missing score display

- **WHEN** a row's score for a given year is `null`
- **THEN** that cell SHALL display an em dash ("—")

#### Scenario: Visible row count

- **WHEN** the table is rendered with any combination of active filters
- **THEN** a count of currently displayed rows versus total rows SHALL always be visible (e.g. "Showing 15 of 93 rows")

### Requirement: Column sorting

Every column (School Name, each year, 5yr Avg) SHALL be sortable by clicking its header, with the current sort column and direction indicated visually in the header.

#### Scenario: First click on a new column

- **WHEN** a user clicks a column header that is not the currently-sorted column
- **THEN** the table SHALL sort by that column
- **AND** direction SHALL default to ascending if the column is School Name, or descending (highest first) if the column is a year or 5yr Avg

#### Scenario: Clicking the active sort column

- **WHEN** a user clicks the header of the column that is already sorted
- **THEN** the sort direction SHALL reverse

#### Scenario: Null values in sorted column

- **WHEN** a column is sorted (in either direction) and some rows have a `null` value for that column
- **THEN** rows with a `null` value SHALL always appear at the bottom of the list, regardless of sort direction

#### Scenario: Default sort on first load

- **WHEN** the page is loaded with a URL containing no sort-related parameters
- **THEN** the table SHALL be sorted by School Name, ascending

### Requirement: Filtering

The table SHALL support three filters — Roman Catholic schools only, Favourites only, and a free-text Search — combined with AND logic, affecting only the table's visible rows and the "Showing X of Y" count (never the comparison chart).

#### Scenario: Roman Catholic filter

- **WHEN** the "Roman Catholic schools only" toggle is on
- **THEN** only rows with `isRomanCatholic: true` SHALL be shown

#### Scenario: Favourites-only filter

- **WHEN** the "Favourites only" toggle is on
- **THEN** only rows currently marked as a favourite SHALL be shown

#### Scenario: Search filter

- **WHEN** the search text is non-empty
- **THEN** only rows whose `school_name` contains the search text as a case-insensitive substring SHALL be shown

#### Scenario: Combined filters

- **WHEN** more than one filter is active at once
- **THEN** a row SHALL be shown only if it satisfies every active filter

#### Scenario: Filters do not affect the chart

- **WHEN** any filter is active and the table's visible rows are a subset of all rows
- **THEN** the comparison chart SHALL continue to reflect every currently favourited row, including those hidden by the active filters

### Requirement: Derived 5-year average column

Each row's "5yr Avg" value SHALL be the arithmetic mean of that row's non-null year scores, excluding years with no data from both the sum and the count, rounded to 1 decimal place.

#### Scenario: Row with some missing years

- **WHEN** a row has scores `null, null, 95, 95, 95`
- **THEN** its 5yr Avg SHALL be `95` (mean of the three present values), not `57`

#### Scenario: Row with no data in any year

- **WHEN** a row has `null` for every year
- **THEN** its 5yr Avg SHALL display as "—"

### Requirement: Favouriting

Every row SHALL have a star toggle (any row, including the two benchmark rows) that immediately flips its favourite status, independent of sort/filter state and with no cap on the number of simultaneous favourites.

#### Scenario: Marking a favourite

- **WHEN** a user clicks the star on a row that is not currently favourited
- **THEN** the star SHALL render filled
- **AND** that row's `id` SHALL be added to the favourited set

#### Scenario: Unmarking a favourite

- **WHEN** a user clicks the star on a row that is currently favourited
- **THEN** the star SHALL render empty/outline
- **AND** that row's `id` SHALL be removed from the favourited set

#### Scenario: Favourite status survives sorting and filtering

- **WHEN** a favourited row is re-sorted to a different position, or hidden by an active filter
- **THEN** its favourite status SHALL remain unchanged

### Requirement: Comparison chart

A chart section SHALL always be present beneath the table, showing one line per currently favourited row plotting its per-year scores (5yr Avg excluded) across the five years in order, updating immediately whenever the favourited set changes.

#### Scenario: Chart Y-axis scaling

- **WHEN** one or more rows are favourited
- **THEN** the chart's vertical axis SHALL be scaled to the range of the favourited rows' actual values plus padding, and SHALL never extend below 0 or above 100

#### Scenario: Gap for missing data

- **WHEN** a favourited row has `null` for one or more years
- **THEN** that row's line SHALL show a visible gap across the missing year(s), with no straight line bridging the gap and no interpolated or zero value substituted

#### Scenario: Legend

- **WHEN** one or more rows are favourited
- **THEN** a legend SHALL list every favourited school's name, each associated with a distinct color matching its line

#### Scenario: Hover emphasis

- **WHEN** a user hovers over a school's entry in the legend
- **THEN** that school's line SHALL be visually emphasized and brought to the front of the drawing order
- **AND** all other lines SHALL be visually muted for the duration of the hover

#### Scenario: Zero favourites

- **WHEN** no rows are currently favourited
- **THEN** the chart area SHALL show an empty-state message instead of an empty chart

### Requirement: URL state persistence

The Roman Catholic filter, Favourites-only filter, search text, sort column/direction, and the complete favourited set SHALL be represented in the URL query string as the sole mechanism for persisting or sharing this page's state, with no other storage.

#### Scenario: Restoring state on load

- **WHEN** the page is loaded with a URL containing any combination of the relevant query parameters
- **THEN** the table SHALL render already reflecting that exact state (filters, sort, favourites, and the chart) with no visible flash of default state beforehand

#### Scenario: Default state

- **WHEN** the page is loaded with a URL containing none of the relevant query parameters
- **THEN** the table SHALL show School Name ascending sort, both filters off, empty search, and zero favourites

#### Scenario: URL updates without new history entries

- **WHEN** a user toggles a filter, types in the search box, clicks a column header, or stars/unstars a row
- **THEN** the URL SHALL update to reflect the new state
- **AND** this update SHALL NOT create a new browser-history entry, so the back button does not require stepping through every intermediate interaction
