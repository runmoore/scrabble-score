## 1. Page Layout and Section Structure

- [x] 1.1 Restructure `app/routes/games/new.tsx` to replace the two-column `lg:flex-row` layout with a single-column stacked layout
- [x] 1.2 Wrap game type selection in a Card component with "Game Type" heading
- [x] 1.3 Wrap player selection in a Card component with "Players" heading
- [x] 1.4 Ensure the game type section is always visible, even when no game types exist

## 2. Game Type Pill Selector

- [x] 2.1 Replace radio button inputs with `sr-only` hidden radios + styled `<label>` pill elements
- [x] 2.2 Style unselected pills: `bg-gray-100 dark:bg-gray-700` with `dark:text-gray-200`
- [x] 2.3 Style selected pills using `peer-checked:` variants: `bg-blue-primary text-white`
- [x] 2.4 Render pills in a `flex flex-wrap gap-2` container for horizontal wrapping layout
- [x] 2.5 Add padding to meet 44px minimum touch target height
- [x] 2.6 Keep "N/A" option as the default-checked radio pill

## 3. Player Pill Selector

- [x] 3.1 Replace checkbox inputs with `sr-only` hidden checkboxes + styled `<label>` pill elements
- [x] 3.2 Style selected pills using `peer-checked:` variants: `bg-purple-primary text-white`
- [x] 3.3 Style unselected pills: `bg-gray-100 dark:bg-gray-700` with `dark:text-gray-200`
- [x] 3.4 Render pills in a `flex flex-wrap gap-2` container
- [x] 3.5 Preserve the existing `onPlayerChange` handler for tracking `selectedPlayers` state

## 4. Start Game Button

- [x] 4.1 Update button text to show "Start Game (N players)" when >= 2 selected, "Select at least 2 players" when < 2
- [x] 4.2 Style enabled state with `bg-green-primary text-white`, disabled with `bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500`
- [x] 4.3 Ensure the button remains full-width and prominent at the bottom of the player section

## 5. Collapsible Add Forms

- [x] 5.1 Add `useState` toggles for `showAddPlayer` and `showAddGameType`
- [x] 5.2 Move the "add game type" form inline within the game type Card, hidden behind a "+ Add game type" text button
- [x] 5.3 Move the "add player" form inline within the player Card, hidden behind a "+ Add player" text button
- [x] 5.4 Style the inline input fields with rounded borders, proper padding, and dark mode support
- [x] 5.5 Style the submit buttons to match the app's existing green action button pattern
- [x] 5.6 Reset the collapsible form state after successful submission (form key pattern already exists)

## 6. Verification and Testing

- [x] 6.1 Verify form submission still sends correct `players[]` and `gameTypeId` fields to the existing server action
- [x] 6.2 Test dark mode rendering for all new elements
- [x] 6.3 Check that existing Cypress e2e tests for game creation still pass (update selectors if needed)
- [x] 6.4 Visually verify on 375px mobile viewport
