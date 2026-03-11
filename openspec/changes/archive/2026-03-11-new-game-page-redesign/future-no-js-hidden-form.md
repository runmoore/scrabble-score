## No-JS: Hidden form element may not submit

**Type:** Potential issue introduced by the redesign (needs testing)

The main game form uses `<Form method="post" id="new-game-form" className="hidden" />` as an empty hidden form element. The radio/checkbox inputs and start button are outside this form and associate via the HTML `form="new-game-form"` attribute.

**Concern:**

The `className="hidden"` applies `display: none` to the `<form>` element. While the HTML `form` attribute is well-supported in modern browsers, a form with `display: none` may behave unexpectedly:

- The form element itself is not visible or interactive
- Associated inputs (via `form` attribute) are outside the form's DOM subtree
- When the submit button (also outside, associated via `form` attribute) is clicked, the browser should still submit the form — but this is an unusual pattern

**Why this pattern exists:**

The page has three separate forms that would otherwise be nested (invalid HTML):

1. Main game form (select players + game type → start game)
2. Add game type form (`gameTypeFetcher.Form`)
3. Add player form (`playerFetcher.Form`)

The hidden form + `form` attribute pattern avoids nesting by placing the main form's inputs as siblings of the fetcher forms, with only a logical (not DOM) association to the main form.

**Testing needed:**

- Verify the form submits correctly with JS disabled in Safari/iOS
- Verify the form submits correctly in Chrome and Firefox
- Check that all associated inputs (`form="new-game-form"`) are included in the POST body

**Alternative if broken:**

If the hidden form approach doesn't work without JS, restructure to use a visible form element. Options:

- Make the form element visible but empty (no `className="hidden"`)
- Move the form element to wrap a non-visible area of the page
- Use a different approach to avoid nested forms (e.g., submit via fetcher for all three actions)

**Relevant code:**

- `app/routes/games/new.tsx` line 111: `<Form method="post" id="new-game-form" className="hidden" />`
- Lines with `form="new-game-form"`: radio inputs (119, 134), checkbox inputs (203), start button (259)
