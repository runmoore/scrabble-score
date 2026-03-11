## Context

The new game page (`app/routes/games/new.tsx`) was redesigned in #35 to use pill toggles. The inline "add player" and "add game type" forms were migrated from Remix `<Form>` to `useFetcher().Form` to avoid nested `<form>` elements. However, the error display and form visibility logic wasn't updated to match the fetcher pattern.

Current state:

- Error display reads `actionData?.errors` — but fetcher forms populate `fetcher.data`, not `actionData`
- Both forms set `onSubmit={() => setShow...(false)}`, hiding the form before the response arrives
- Game type form has no error display at all
- No whitespace trimming on name inputs

## Goals / Non-Goals

**Goals:**

- Errors from fetcher submissions are visible to the user
- Forms stay open when there's an error, so the user can correct and retry
- Whitespace-only names are rejected the same as empty names
- Both add-player and add-game-type forms have consistent error handling

**Non-Goals:**

- Client-side validation (server validation is sufficient for this fix)
- Changing the fetcher pattern or reverting to `<Form>`
- Adding character limits or other name constraints

## Decisions

### 1. Read errors from `fetcher.data` instead of `actionData`

Each fetcher has its own `.data` property. Replace `actionData?.errors` with `playerFetcher.data?.errors` and `gameTypeFetcher.data?.errors` respectively. Remove the now-unused `useActionData` import.

### 2. Conditionally hide forms only on success

Instead of hiding the form unconditionally in `onSubmit`, use a `useEffect` that watches the fetcher data. Only call `setShow...(false)` when the fetcher returns with no errors (i.e., `fetcher.data?.errors === ""`). This keeps the form open with the error message visible on validation failure.

Remove `onSubmit={() => setShow...(false)}` from both forms.

### 3. Trim names server-side in the action handler

Apply `.trim()` to the name value immediately after extracting it from `formData`, before the empty check. This way `" "` becomes `""` and fails the `if (!name)` check. Also pass the trimmed value to `addPlayer`/`addGameType` so stored names don't have leading/trailing whitespace.

### 4. Error display placement

Show errors below the input field in both forms, using the same red text styling (`text-red-500 dark:text-red-400`). Move the error `<span>` from inline between input and button to a new line below the input row for better readability.

## Risks / Trade-offs

- **Fetcher key resets data on success**: Both forms use `key={...length}` which remounts the form when the list grows (on successful add). This naturally clears the fetcher data on success, which is the desired behavior. No risk here.
- **useEffect for form visibility**: Slightly more complex than the `onSubmit` approach, but necessary to distinguish success from error responses.
