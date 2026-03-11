## 1. Server-side validation fixes

- [x] 1.1 Add `.trim()` to player name extraction in the `add-player` action case, before the empty check
- [x] 1.2 Add `.trim()` to game type name extraction in the `add-game-type` action case, before the empty check
- [x] 1.3 Pass the trimmed name to `addPlayer()` and `addGameType()` so stored names have no leading/trailing whitespace

## 2. Error display wiring

- [x] 2.1 Replace `actionData?.errors` with `playerFetcher.data?.errors` in the add-player form error display
- [x] 2.2 Add error display (`text-red-500 dark:text-red-400`) to the add-game-type form, reading from `gameTypeFetcher.data?.errors`
- [x] 2.3 Remove the unused `useActionData` import and `actionData` variable

## 3. Form visibility on error

- [x] 3.1 Remove `onSubmit={() => setShowAddPlayer(false)}` from the player fetcher form
- [x] 3.2 Remove `onSubmit={() => setShowAddGameType(false)}` from the game type fetcher form
- [x] 3.3 Add `useEffect` watching `playerFetcher.data` — call `setShowAddPlayer(false)` only when `errors === ""`
- [x] 3.4 Add `useEffect` watching `gameTypeFetcher.data` — call `setShowAddGameType(false)` only when `errors === ""`

## 4. Testing

- [x] 4.1 Add unit tests for whitespace trimming in the action handler (empty, whitespace-only, padded names)
- [x] 4.2 Add unit tests verifying error responses for both add-player and add-game-type with blank/whitespace names
