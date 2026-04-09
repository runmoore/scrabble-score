import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  useAnagramState,
  queryToLetters,
  queryToBlankNewWord,
  findNextBlankLetter,
  sanitiseQuery,
} from "./useAnagramState";

describe("sanitiseQuery", () => {
  it("removes whitespace characters", () => {
    expect(sanitiseQuery("a b c")).toBe("abc");
  });

  it("returns empty string for blank input", () => {
    expect(sanitiseQuery("")).toBe("");
  });
});

describe("queryToLetters", () => {
  it("converts a string to an array of undismissed letters", () => {
    const letters = queryToLetters("cat");
    expect(letters).toEqual([
      { character: "c", isDismissed: false },
      { character: "a", isDismissed: false },
      { character: "t", isDismissed: false },
    ]);
  });

  it("strips whitespace characters", () => {
    const letters = queryToLetters("c a t");
    expect(letters).toHaveLength(3);
  });
});

describe("queryToBlankNewWord", () => {
  it("returns an array of empty strings matching the word length", () => {
    expect(queryToBlankNewWord("cat")).toEqual(["", "", ""]);
  });
});

describe("findNextBlankLetter", () => {
  it("returns the index of the next blank letter after startIndex", () => {
    expect(findNextBlankLetter(["a", "", ""], 0)).toBe(1);
  });

  it("wraps around to the beginning when searching", () => {
    expect(findNextBlankLetter(["", "a", "b"], 1)).toBe(0);
  });

  it("returns -1 when no blank letters exist", () => {
    expect(findNextBlankLetter(["a", "b", "c"], 0)).toBe(-1);
  });

  it("finds blank at start index itself when it is blank", () => {
    expect(findNextBlankLetter(["", "a", "b"], 0)).toBe(0);
  });
});

describe("useAnagramState", () => {
  it("initialises letters and newWord from the search query", () => {
    const { result } = renderHook(() => useAnagramState("cat"));

    expect(result.current.letters).toEqual([
      { character: "c", isDismissed: false },
      { character: "a", isDismissed: false },
      { character: "t", isDismissed: false },
    ]);
    expect(result.current.newWord).toEqual(["", "", ""]);
    expect(result.current.indexOfNewWord).toBe(0);
    expect(result.current.undoStack).toEqual([]);
  });

  describe("placeLetter", () => {
    it("places the letter into the current word position", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });

      expect(result.current.newWord[0]).toBe("c");
    });

    it("dismisses the circle letter", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });

      expect(result.current.letters[0].isDismissed).toBe(true);
    });

    it("advances the cursor to the next blank position", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });

      expect(result.current.indexOfNewWord).toBe(1);
    });

    it("pushes the word position onto the undo stack", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });

      expect(result.current.undoStack).toEqual([0]);
    });

    it("places multiple letters in sequence", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0); // c → newWord[0]
      });
      act(() => {
        result.current.placeLetter(1); // a → newWord[1]
      });

      expect(result.current.newWord).toEqual(["c", "a", ""]);
      expect(result.current.undoStack).toEqual([0, 1]);
    });
  });

  describe("removeLetter", () => {
    it("removes a placed letter from the word and un-dismisses the circle letter", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0); // place 'c' at word[0]
      });
      act(() => {
        result.current.removeLetter(0); // remove from word[0]
      });

      expect(result.current.newWord[0]).toBe("");
      expect(result.current.letters[0].isDismissed).toBe(false);
    });

    it("removes the word position from the undo stack", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });
      act(() => {
        result.current.placeLetter(1);
      });
      act(() => {
        result.current.removeLetter(0);
      });

      expect(result.current.undoStack).toEqual([1]);
    });

    it("moves the cursor to the removed position", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0); // cursor advances to 1
      });
      act(() => {
        result.current.placeLetter(1); // cursor advances to 2
      });
      act(() => {
        result.current.removeLetter(0);
      });

      expect(result.current.indexOfNewWord).toBe(0);
    });

    it("moves the cursor when clicking a blank word position", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.removeLetter(2);
      });

      expect(result.current.indexOfNewWord).toBe(2);
      expect(result.current.newWord).toEqual(["", "", ""]);
    });
  });

  describe("undo", () => {
    it("reverses the last placeLetter call", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });
      act(() => {
        result.current.undo();
      });

      expect(result.current.newWord[0]).toBe("");
      expect(result.current.letters[0].isDismissed).toBe(false);
      expect(result.current.undoStack).toEqual([]);
    });

    it("restores the cursor to the undone word position", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0); // places at 0, cursor → 1
      });
      act(() => {
        result.current.undo();
      });

      expect(result.current.indexOfNewWord).toBe(0);
    });

    it("does nothing when the undo stack is empty", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.undo();
      });

      expect(result.current.newWord).toEqual(["", "", ""]);
      expect(result.current.undoStack).toEqual([]);
    });

    it("undoes multiple steps in reverse order", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0); // 'c' at word[0]
      });
      act(() => {
        result.current.placeLetter(1); // 'a' at word[1]
      });
      act(() => {
        result.current.undo(); // undo 'a' at word[1]
      });

      expect(result.current.newWord).toEqual(["c", "", ""]);
      expect(result.current.letters[1].isDismissed).toBe(false);

      act(() => {
        result.current.undo(); // undo 'c' at word[0]
      });

      expect(result.current.newWord).toEqual(["", "", ""]);
      expect(result.current.letters[0].isDismissed).toBe(false);
    });
  });

  describe("clear", () => {
    it("resets the word, letters and undo stack", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      act(() => {
        result.current.placeLetter(0);
      });
      act(() => {
        result.current.placeLetter(1);
      });
      act(() => {
        result.current.clear();
      });

      expect(result.current.newWord).toEqual(["", "", ""]);
      expect(result.current.letters.every((l) => !l.isDismissed)).toBe(true);
      expect(result.current.undoStack).toEqual([]);
      expect(result.current.indexOfNewWord).toBe(0);
    });
  });

  describe("shuffle", () => {
    it("keeps the same set of characters after shuffling", () => {
      const { result } = renderHook(() => useAnagramState("scrabble"));

      const charsBefore = result.current.letters
        .map((l) => l.character)
        .sort()
        .join("");

      act(() => {
        result.current.shuffle();
      });

      const charsAfter = result.current.letters
        .map((l) => l.character)
        .sort()
        .join("");

      expect(charsAfter).toBe(charsBefore);
    });
  });

  describe("goToNextBlank", () => {
    it("advances the cursor to the next blank word position", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      // Place 'c' at word[0], cursor moves to word[1]
      act(() => {
        result.current.placeLetter(0);
      });

      // Now fill word[1] directly to simulate a gap, then test goToNextBlank
      // Place 'a' at word[1], cursor moves to word[2]
      act(() => {
        result.current.placeLetter(1);
      });

      // Move cursor back to 0 by removing
      act(() => {
        result.current.removeLetter(0);
      });

      // Cursor is at 0 now; goToNextBlank should skip 0 (blank) ... wait, 0 is blank
      // Actually word is now ["", "a", ""] cursor=0
      // goToNextBlank starts at indexOfNewWord+1=1, first blank after 1 wrapping is 2
      act(() => {
        result.current.goToNextBlank();
      });

      expect(result.current.indexOfNewWord).toBe(2);
    });

    it("wraps around to find the next blank", () => {
      const { result } = renderHook(() => useAnagramState("cat"));

      // Fill positions 0 and 1, leave 2 blank
      act(() => {
        result.current.placeLetter(0); // c at word[0], cursor→1
      });
      act(() => {
        result.current.placeLetter(1); // a at word[1], cursor→2
      });

      // cursor is at 2 (blank); goToNextBlank from 3 wraps around → finds 2 again (only blank)
      act(() => {
        result.current.goToNextBlank();
      });

      // Only blank is at index 2, so cursor stays/wraps to 2
      expect(result.current.indexOfNewWord).toBe(2);
    });
  });

  describe("searchQuery change", () => {
    it("resets all state when the search query changes", () => {
      let searchQuery = "cat";
      const { result, rerender } = renderHook(() =>
        useAnagramState(searchQuery)
      );

      act(() => {
        result.current.placeLetter(0);
      });

      searchQuery = "dog";
      rerender();

      expect(result.current.letters).toEqual([
        { character: "d", isDismissed: false },
        { character: "o", isDismissed: false },
        { character: "g", isDismissed: false },
      ]);
      expect(result.current.newWord).toEqual(["", "", ""]);
      expect(result.current.indexOfNewWord).toBe(0);
      expect(result.current.undoStack).toEqual([]);
    });
  });
});
