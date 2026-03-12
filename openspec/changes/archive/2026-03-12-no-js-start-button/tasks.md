## 1. Server-side error handling

- [x] 1.1 Change the `start-new-game` action case to return `json({ errors: { players: "You must select at least 2 players to play" } }, { status: 400 })` instead of `throw new Error(...)`
- [x] 1.2 Add `useActionData` import and hook call in the component to read action errors

## 2. Remove disabled attribute and update button

- [x] 2.1 Remove the `disabled={selectedPlayers.length < 2}` prop from the Start Game button
- [x] 2.2 Change button text to render "Start Game" as the SSR default, with JS-enhanced dynamic text (`selectedPlayers.length >= 2 ? "Start Game (N players)" : "Select at least 2 players"`)
- [x] 2.3 Replace `disabled:` Tailwind variants with opacity-based muted styling when JS is active and fewer than 2 players are selected (e.g., `opacity-50` when insufficient, full opacity + `green-primary` when ready)

## 3. Inline error display

- [x] 3.1 Display the server validation error inline below the Start Game button in red text (`text-red-500 dark:text-red-400`) when `actionData?.errors?.players` is present

## 4. Testing

- [x] 4.1 Update or add a Vitest unit test verifying the action returns JSON with a 400 status (not a thrown error) when fewer than 2 players are submitted
- [x] 4.2 Verify the button renders without a `disabled` attribute in server-rendered HTML
