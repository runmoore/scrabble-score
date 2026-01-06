import { describe, test, expect } from "vitest";

// Helper functions will be imported from the cryptogram route
// These imports will fail initially (expected for TDD)
import {
  applyMappings,
  sanitizePuzzleText,
  getConflictingLetters,
} from "./cryptogram";

describe("applyMappings", () => {
  test("applies simple letter mappings to puzzle text", () => {
    const puzzleText = "HELLO WORLD";
    const mappings = { H: "T", E: "E", L: "S", O: "O", W: "W", R: "R", D: "D" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("TESSO WORSD");
  });

  test("preserves original case in mapped text", () => {
    const puzzleText = "Hello World";
    const mappings = { H: "T", E: "E", L: "S", O: "O", W: "W", R: "R", D: "D" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("Tesso Worsd");
  });

  test("leaves unmapped letters as original cipher text", () => {
    const puzzleText = "HELLO";
    const mappings = { H: "T", E: "E" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("TELLO");
  });

  test("preserves spaces and punctuation", () => {
    const puzzleText = "HELLO, WORLD!";
    const mappings = { H: "T", E: "E", L: "S", O: "O", W: "W", R: "R", D: "D" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("TESSO, WORSD!");
  });

  test("preserves numbers in puzzle text", () => {
    const puzzleText = "HELLO 123 WORLD";
    const mappings = { H: "T", E: "E", L: "S", O: "O", W: "W", R: "R", D: "D" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("TESSO 123 WORSD");
  });

  test("handles empty mappings object", () => {
    const puzzleText = "HELLO";
    const mappings = {};

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("HELLO");
  });

  test("handles empty puzzle text", () => {
    const puzzleText = "";
    const mappings = { H: "T" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("");
  });

  test("handles mixed case with partial mappings", () => {
    const puzzleText = "HeLLo WoRLd";
    const mappings = { H: "T", L: "S" };

    const result = applyMappings(puzzleText, mappings);

    expect(result).toBe("TeSSo WoRSd");
  });
});

describe("sanitizePuzzleText", () => {
  test("preserves letters and spaces", () => {
    const text = "HELLO WORLD";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("HELLO WORLD");
  });

  test("preserves special characters", () => {
    const text = "HELLO, WORLD!";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("HELLO, WORLD!");
  });

  test("preserves numbers", () => {
    const text = "HELLO 123 WORLD";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("HELLO 123 WORLD");
  });

  test("preserves punctuation marks", () => {
    const text = "HELLO? YES! NO...";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("HELLO? YES! NO...");
  });

  test("preserves quotes and apostrophes", () => {
    const text = 'IT\'S "HELLO" WORLD';

    const result = sanitizePuzzleText(text);

    expect(result).toBe('IT\'S "HELLO" WORLD');
  });

  test("handles empty string", () => {
    const text = "";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("");
  });

  test("handles text with newlines", () => {
    const text = "HELLO\nWORLD";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("HELLO\nWORLD");
  });

  test("handles text with mixed content", () => {
    const text = "ABC-123, XYZ! (2024)";

    const result = sanitizePuzzleText(text);

    expect(result).toBe("ABC-123, XYZ! (2024)");
  });
});

describe("getConflictingLetters", () => {
  test("detects when two cipher letters map to same plain letter", () => {
    const mappings = { A: "E", B: "T", C: "E" };

    const result = getConflictingLetters(mappings);

    expect(result).toContain("A");
    expect(result).toContain("C");
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no conflicts exist", () => {
    const mappings = { A: "E", B: "T", C: "O" };

    const result = getConflictingLetters(mappings);

    expect(result).toEqual([]);
  });

  test("handles multiple conflicts", () => {
    const mappings = { A: "E", B: "E", C: "T", D: "T" };

    const result = getConflictingLetters(mappings);

    expect(result).toContain("A");
    expect(result).toContain("B");
    expect(result).toContain("C");
    expect(result).toContain("D");
    expect(result).toHaveLength(4);
  });

  test("handles three cipher letters mapping to same plain letter", () => {
    const mappings = { A: "E", B: "E", C: "E" };

    const result = getConflictingLetters(mappings);

    expect(result).toContain("A");
    expect(result).toContain("B");
    expect(result).toContain("C");
    expect(result).toHaveLength(3);
  });

  test("returns empty array for empty mappings", () => {
    const mappings = {};

    const result = getConflictingLetters(mappings);

    expect(result).toEqual([]);
  });

  test("ignores empty string mappings", () => {
    const mappings = { A: "E", B: "", C: "" };

    const result = getConflictingLetters(mappings);

    expect(result).toEqual([]);
  });

  test("handles single mapping without conflict", () => {
    const mappings = { A: "E" };

    const result = getConflictingLetters(mappings);

    expect(result).toEqual([]);
  });

  test("detects conflicts only for duplicates, not unique mappings", () => {
    const mappings = { A: "E", B: "T", C: "O", D: "T", E: "T" };

    const result = getConflictingLetters(mappings);

    // B, D, and E all conflict (all three map to T)
    expect(result).toContain("B");
    expect(result).toContain("D");
    expect(result).toContain("E");
    expect(result).not.toContain("A");
    expect(result).not.toContain("C");
  });
});
