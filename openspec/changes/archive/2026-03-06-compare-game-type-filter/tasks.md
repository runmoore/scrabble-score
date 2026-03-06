## 1. Loader: server-side filtering and available game types

- [x] 1.1 Parse `type` search param from `request.url` in the loader
- [x] 1.2 Collect `availableGameTypes` (distinct `{ id, name }` pairs) from unfiltered `relevantGames` before any filtering
- [x] 1.3 Filter `relevantGames` by selected type ID (if `type` param present) before computing stats
- [x] 1.4 Return `availableGameTypes` in the loader JSON response

## 2. Filter pills UI

- [x] 2.1 Add pill filter row between the page title and stat card grid — horizontally scrollable, with one pill per `availableGameType`
- [x] 2.2 Style selected pills as `bg-blue-primary text-white` and unselected as `bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`
- [x] 2.3 Hide the pill row entirely when `availableGameTypes` is empty (no games have types)

## 3. Pill interaction logic (single-select)

- [x] 3.1 Use `useSearchParams` to read current `type` param and determine selected state for each pill
- [x] 3.2 Clicking an unselected pill sets `type` param to that game type ID (replacing any previous selection)
- [x] 3.3 Clicking the currently selected pill removes the `type` param (back to all games)

## 4. Testing

- [x] 4.1 Add unit tests for loader filtering logic: no param returns all games, single type param filters correctly
- [x] 4.2 Update tests: remove multi-select tests, verify single type param works correctly
