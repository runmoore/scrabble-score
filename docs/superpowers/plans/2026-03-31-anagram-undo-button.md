# Anagram Undo Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an undo button to the anagram page that reverses letter placements in the order they were added, enabling quick experimentation after placing known letters.

**Architecture:** Introduce a history stack (`number[]`) that records the `wordIndex` of each letter placement. Undo pops the last entry, reads the character from `newWord[wordIndex]`, clears it, and un-dismisses the first matching dismissed circle letter. This approach is shuffle-proof since it doesn't track circle array indices. The stack is cleared when the word changes or "Clear" is pressed.

**Tech Stack:** React useState, TypeScript, Tailwind CSS

---

## File Structure

| File                     | Action | Responsibility                                                                               |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------- |
| `app/routes/anagram.tsx` | Modify | Add history stack state, undo handler, undo button UI, wire into existing place/remove logic |

---

### Task 1: Add history stack state and clear on reset

**Files:**

- Modify: `app/routes/anagram.tsx:108-159` (state declarations, useEffect, clearNewWord)

- [ ] **Step 1: Add history state**

In `app/routes/anagram.tsx`, after the `indexOfNewWord` state declaration (line 115), add:

```typescript
const [undoStack, setUndoStack] = useState<number[]>([]);
```

- [ ] **Step 2: Clear history when word changes**

In the `useEffect` that runs on `searchQuery` change (line 123-140), add `setUndoStack([])` after `setIndexOfNewWord(0)` on line 126:

```typescript
useEffect(() => {
    setLetters(queryToLetters(searchQuery));
    setNewWord(queryToBlankNewWord(searchQuery));
    setIndexOfNewWord(0);
    setUndoStack([]);
    // ... rest unchanged
```

- [ ] **Step 3: Clear history in clearNewWord**

In the `clearNewWord` function (line 153-159), add `setUndoStack([])`:

```typescript
const clearNewWord = () => {
  setIndexOfNewWord(0);
  setNewWord(queryToBlankNewWord(searchQuery));
  setLetters((value) =>
    value.map((letter) => ({ ...letter, isDismissed: false }))
  );
  setUndoStack([]);
};
```

- [ ] **Step 4: Commit**

```bash
git add app/routes/anagram.tsx
git commit -m "$(cat <<'EOF'
feat(anagram): add undo history stack with reset on word change and clear

Introduce an undoStack (number[]) that will track the wordIndex of each
letter placement. The stack is cleared whenever the search query changes
or the user hits Clear, so undo history stays in sync with the current
word state.

This is the foundation for the undo button — subsequent commits will
wire up the push/pop logic and the UI.
EOF
)"
```

---

### Task 2: Push to history when letters are placed from circle

**Files:**

- Modify: `app/routes/anagram.tsx:260-283` (circle letter onClick handler)

When a user clicks a circle letter to place it, push `indexOfNewWord` onto the stack. When they click a circle letter to un-dismiss it (removing from word), remove the corresponding entry.

- [ ] **Step 1: Update the circle letter onClick to push/remove history**

In the `onClick` handler for the circle letters, update the `if (isDismissed)` branch to push, and the `else` branch to remove. The full updated handler:

```typescript
onClick={(isDismissed) => {
    const updatedLetters = [...letters];
    updatedLetters[i].isDismissed = isDismissed;
    setLetters(updatedLetters);

    if (isDismissed) {
      let updatedWord = [...newWord];
      updatedWord[indexOfNewWord] = character;

      setNewWord(updatedWord);
      setUndoStack((prev) => [...prev, indexOfNewWord]);
      setIndexOfNewWord(
        findNextBlankLetter(updatedWord, indexOfNewWord)
      );
    } else {
      const index = newWord.lastIndexOf(character);

      if (index > -1) {
        const updatedWord = [...newWord];
        updatedWord[index] = "";
        setNewWord(updatedWord);

        // Remove the last history entry for this word position
        setUndoStack((prev) => {
          const lastIdx = prev.findLastIndex((wi) => wi === index);
          if (lastIdx > -1) {
            return prev.filter((_, idx) => idx !== lastIdx);
          }
          return prev;
        });

        setIndexOfNewWord(index);
      }
    }
  }}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/anagram.tsx
git commit -m "$(cat <<'EOF'
feat(anagram): track letter placements in undo stack

When a circle letter is clicked to place it, push its wordIndex onto the
undo stack. When a circle letter is clicked to un-dismiss it (removing
from the word), find and remove the matching stack entry.

The stack only tracks word positions, not circle array indices, so it
remains valid even after shuffling the circle letters.
EOF
)"
```

---

### Task 3: Remove from history when placed letters are clicked directly

**Files:**

- Modify: `app/routes/anagram.tsx:327-342` (placed letter onClick handler)

When a user clicks a placed letter (bottom row) to remove it, remove the corresponding entry from the undo stack.

- [ ] **Step 1: Update the placed letter onClick to remove from history**

Replace the existing onClick handler (lines 327-342) with:

```typescript
onClick={() => {
    if (newWord[i] !== "") {
      let updatedWord = [...newWord];
      updatedWord[i] = "";
      setNewWord(updatedWord);

      const updatedLetters = [...letters];
      const index = updatedLetters.findIndex(
        ({ character, isDismissed }) =>
          character === newWord[i] && isDismissed
      );
      updatedLetters[index].isDismissed = false;

      // Remove the last history entry for this word position
      setUndoStack((prev) => {
        const lastIdx = prev.findLastIndex((wi) => wi === i);
        if (lastIdx > -1) {
          return prev.filter((_, idx) => idx !== lastIdx);
        }
        return prev;
      });
    }
    setIndexOfNewWord(i);
  }}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/anagram.tsx
git commit -m "$(cat <<'EOF'
feat(anagram): remove undo stack entries when letters are manually removed

When a user clicks a placed letter in the word row to remove it, also
clean up the corresponding entry in the undo stack. This keeps the stack
consistent so that undo never tries to reverse an action the user already
reversed manually.
EOF
)"
```

---

### Task 4: Implement undo handler and add button

**Files:**

- Modify: `app/routes/anagram.tsx` (add undo function near `clearNewWord`, add button to UI)

- [ ] **Step 1: Add the undo function**

After the `clearNewWord` function, add:

```typescript
const undo = () => {
  if (undoStack.length === 0) return;

  const wordIndex = undoStack[undoStack.length - 1];
  const character = newWord[wordIndex];

  // Clear the placed letter
  const updatedWord = [...newWord];
  updatedWord[wordIndex] = "";
  setNewWord(updatedWord);

  // Un-dismiss the first matching dismissed circle letter
  const updatedLetters = [...letters];
  const letterIdx = updatedLetters.findIndex(
    (l) => l.character === character && l.isDismissed
  );
  if (letterIdx > -1) {
    updatedLetters[letterIdx] = {
      ...updatedLetters[letterIdx],
      isDismissed: false,
    };
    setLetters(updatedLetters);
  }

  // Move cursor to the cleared position
  setIndexOfNewWord(wordIndex);

  // Pop the last entry
  setUndoStack((prev) => prev.slice(0, -1));
};
```

- [ ] **Step 2: Add the Undo button to the button row**

Add the Undo button after the existing "Next" button (after line 312), inside the same `<div>`:

```tsx
<button
  onClick={undo}
  disabled={undoStack.length === 0}
  className="ml-4 rounded-2xl border border-black bg-gray-100 p-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-400 dark:bg-gray-800 dark:text-gray-200"
>
  Undo
</button>
```

- [ ] **Step 3: Verify manually in the browser**

Run: `npm run dev`

1. Navigate to `/anagram?word=testing`
2. Click letters in the circle to place them
3. Click "Undo" - the last placed letter should return to the circle
4. Shuffle, then undo - should still work correctly
5. Verify Undo is disabled when no letters are placed
6. Verify "Clear" resets undo history (Undo becomes disabled)

- [ ] **Step 4: Commit**

```bash
git add app/routes/anagram.tsx
git commit -m "$(cat <<'EOF'
feat(anagram): add undo button to reverse letter placements

Add an Undo button (last in the Shuffle/Clear/Next row) that pops the
most recent placement off the undo stack, clears the word position, and
un-dismisses the first matching circle letter.

This is shuffle-proof: undo finds the letter by character match rather
than array index, so shuffling the circle between placements doesn't
break anything. The button is disabled when nothing is left to undo,
and supports undoing all the way back to an empty word.

Motivated by the workflow of placing known letters first, then
experimenting — undo lets you quickly back out experimental placements
without losing the known ones.
EOF
)"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full validation**

Run: `npm run validate`
Expected: All lint, typecheck, vitest, and cypress tests pass.

- [ ] **Step 2: Test the user's workflow**

Manually verify the core use case:

1. Enter a word like "restaurant"
2. Place known letters (e.g., r, e, s, t)
3. Experiment by placing more letters
4. Hit Undo multiple times to back out the experimental letters
5. The known letters should remain placed
6. Verify cursor moves to the undone position each time
7. Shuffle letters, then undo - verify it still works correctly
