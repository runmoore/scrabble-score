import {
  sanitiseQuery,
  queryToBlankNewWord,
  queryToLetters,
  generateRadius,
  removeLastOccurrence,
  findNextBlankLetter,
} from "./anagram";

describe("sanitiseQuery", () => {
  it("returns the same string when there are no spaces", () => {
    expect(sanitiseQuery("hello")).toBe("hello");
  });

  it("strips spaces between characters", () => {
    expect(sanitiseQuery("h e l l o")).toBe("hello");
  });

  it("strips tab characters", () => {
    expect(sanitiseQuery("h\te")).toBe("he");
  });

  it("returns an empty string for an empty input", () => {
    expect(sanitiseQuery("")).toBe("");
  });

  it("returns an empty string for an all-whitespace input", () => {
    expect(sanitiseQuery("   ")).toBe("");
  });
});

describe("queryToBlankNewWord", () => {
  it("returns an empty array for an empty string", () => {
    expect(queryToBlankNewWord("")).toEqual([]);
  });

  it("returns an array of empty strings matching the sanitised query length", () => {
    expect(queryToBlankNewWord("abc")).toEqual(["", "", ""]);
  });

  it("ignores spaces when calculating length", () => {
    expect(queryToBlankNewWord("a b c")).toEqual(["", "", ""]);
  });
});

describe("queryToLetters", () => {
  it("returns Letter objects for each character in a normal word", () => {
    const result = queryToLetters("cat");
    expect(result).toEqual([
      { character: "c", isDismissed: false },
      { character: "a", isDismissed: false },
      { character: "t", isDismissed: false },
    ]);
  });

  it("sets isDismissed to false for all letters", () => {
    const result = queryToLetters("hi");
    expect(result.every((l) => l.isDismissed === false)).toBe(true);
  });

  it("returns an empty array for an empty string", () => {
    expect(queryToLetters("")).toEqual([]);
  });

  it("strips spaces before creating letters", () => {
    expect(queryToLetters("a b")).toEqual([
      { character: "a", isDismissed: false },
      { character: "b", isDismissed: false },
    ]);
  });
});

describe("generateRadius", () => {
  it("returns 0 for a single letter", () => {
    expect(generateRadius(1)).toBe(0);
  });

  it("scales radius with letter count", () => {
    const count = 7;
    const expected = (count * 48) / (2 * Math.PI);
    expect(generateRadius(count)).toBeCloseTo(expected);
  });
});

describe("removeLastOccurrence", () => {
  it("removes the only occurrence of a value", () => {
    expect(removeLastOccurrence([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("removes only the last occurrence when the value appears multiple times", () => {
    expect(removeLastOccurrence([1, 2, 3, 2, 4], 2)).toEqual([1, 2, 3, 4]);
  });

  it("returns the original array when the value is not present", () => {
    const stack = [1, 2, 3];
    expect(removeLastOccurrence(stack, 5)).toEqual([1, 2, 3]);
  });
});

describe("findNextBlankLetter", () => {
  it("returns the startIndex when that slot is blank", () => {
    expect(findNextBlankLetter(["", "a", "b"], 0)).toBe(0);
  });

  it("wraps around past the end to find a blank slot", () => {
    expect(findNextBlankLetter(["x", "", "y"], 2)).toBe(1);
  });

  it("returns -1 when all slots are filled", () => {
    expect(findNextBlankLetter(["a", "b", "c"], 0)).toBe(-1);
  });

  it("returns startIndex when all slots are blank", () => {
    expect(findNextBlankLetter(["", "", ""], 1)).toBe(1);
  });
});
