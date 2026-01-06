import { Form, useSearchParams } from "@remix-run/react";
import { useMemo, useState } from "react";

// =============================================================================
// HELPER FUNCTIONS (T008)
// =============================================================================

/**
 * Apply letter mappings to puzzle text with case preservation
 */
export function applyMappings(
  puzzleText: string,
  mappings: Record<string, string>
): string {
  return puzzleText
    .split("")
    .map((char) => {
      const upper = char.toUpperCase();
      if (/[A-Z]/.test(upper)) {
        const mapped = mappings[upper];
        if (mapped) {
          // Preserve original case
          return char === upper ? mapped : mapped.toLowerCase();
        }
      }
      // Non-letter or unmapped - return as-is
      return char;
    })
    .join("");
}

/**
 * Get list of cipher letters involved in mapping conflicts
 */
export function getConflictingLetters(
  mappings: Record<string, string>
): string[] {
  const reversed: Record<string, string[]> = {};

  for (const [cipher, plain] of Object.entries(mappings)) {
    if (!plain) continue; // Skip empty mappings
    if (!reversed[plain]) reversed[plain] = [];
    reversed[plain].push(cipher);
  }

  const conflicts: string[] = [];
  for (const ciphers of Object.values(reversed)) {
    if (ciphers.length > 1) {
      conflicts.push(...ciphers);
    }
  }

  return conflicts;
}

/**
 * Sanitize puzzle text (preserves all characters as-is)
 */
export function sanitizePuzzleText(text: string): string {
  return text;
}

// =============================================================================
// INLINE COMPONENTS
// =============================================================================

/**
 * PuzzleInput Component (T009)
 * Large textarea for entering the cryptogram puzzle
 */
function PuzzleInput({
  value,
  onChange,
  maxLength = 1000,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  const charCount = value.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="space-y-2">
      <label htmlFor="puzzle-input" className="block text-sm font-medium">
        Enter Cryptogram Puzzle
      </label>
      <textarea
        id="puzzle-input"
        name="puzzle"
        aria-label="Puzzle text input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-300 p-4 font-mono text-lg focus:border-blue-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
        rows={6}
        placeholder="Enter your encrypted puzzle text here..."
        style={{ minHeight: "120px", touchAction: "manipulation" }}
      />
      <div className="flex justify-between text-sm">
        <span className={isOverLimit ? "text-red-primary" : "text-gray-600"}>
          {charCount} / {maxLength} characters
        </span>
        {isOverLimit && (
          <span className="font-medium text-red-primary">
            Exceeds maximum length
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * PuzzleDisplay Component (T010)
 * Shows original encrypted text and decrypted text with visual distinction
 */
function PuzzleDisplay({
  puzzleText,
  decryptedText,
  mappings,
}: {
  puzzleText: string;
  decryptedText: string;
  mappings: Record<string, string>;
}) {
  if (!puzzleText) {
    return null;
  }

  // Determine which letters are solved (have mappings)
  const renderDecryptedText = () => {
    return decryptedText.split("").map((char, index) => {
      const originalChar = puzzleText[index];
      const upper = originalChar.toUpperCase();
      const isSolved = /[A-Z]/.test(upper) && mappings[upper];

      return (
        <span
          key={index}
          className={
            isSolved
              ? "solved-letter font-bold text-green-primary"
              : "unsolved-letter text-gray-600"
          }
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Original (Encrypted):
        </h3>
        <div
          data-testid="encrypted-text"
          className="font-mono text-base text-gray-500"
          style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        >
          {puzzleText}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Decrypted (Your Solution):
        </h3>
        <div
          data-testid="decrypted-text"
          className="font-mono text-lg"
          style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        >
          {renderDecryptedText()}
        </div>
      </div>
    </div>
  );
}

/**
 * MappingGrid Component (T011)
 * 26 letter inputs (A-Z) in grid layout for creating cipher-to-plain mappings
 */
function MappingGrid({
  mappings,
  onMappingChange,
  onClearAll,
  disabled,
}: {
  mappings: Record<string, string>;
  onMappingChange: (cipher: string, plain: string) => void;
  onClearAll: () => void;
  disabled: boolean;
}) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const conflicts = getConflictingLetters(mappings);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Letter Mappings (A-Z)</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="rounded bg-red-primary px-3 py-1 text-sm text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-primary disabled:opacity-50"
          disabled={disabled}
          aria-label="Clear all mappings"
        >
          Clear All
        </button>
      </div>

      <div className="lg:grid-cols-13 grid grid-cols-6 gap-2 md:grid-cols-8">
        {alphabet.map((letter) => {
          const hasConflict = conflicts.includes(letter);
          const value = mappings[letter] || "";

          return (
            <div key={letter} className="flex flex-col items-center">
              <label
                htmlFor={`mapping-${letter}`}
                className="mb-1 text-xs font-medium text-gray-600"
              >
                {letter}
              </label>
              <input
                id={`mapping-${letter}`}
                type="text"
                inputMode="text"
                maxLength={1}
                value={value}
                onChange={(e) => {
                  const inputValue = e.target.value.toUpperCase();
                  onMappingChange(letter, inputValue);
                }}
                disabled={disabled}
                aria-label={`Mapping for ${letter}`}
                className={`h-11 w-11 rounded border text-center font-mono text-lg uppercase focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:opacity-50 ${
                  hasConflict
                    ? "border-red-primary ring-2 ring-red-primary"
                    : "border-gray-300 focus:border-blue-primary focus:ring-blue-primary"
                }`}
                style={{ minWidth: "44px", minHeight: "44px" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT (T013)
// =============================================================================

export default function Cryptogram() {
  const [searchParams] = useSearchParams();
  const initialPuzzle = searchParams.get("puzzle") || "";

  // Basic state for testing components built so far
  const [puzzleText, setPuzzleText] = useState(initialPuzzle);
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Compute decrypted text using applyMappings helper (T008)
  const decryptedText = useMemo(
    () => applyMappings(puzzleText, mappings),
    [puzzleText, mappings]
  );

  // Event handlers
  const handlePuzzleChange = (value: string) => {
    setPuzzleText(value);
  };

  const handleMappingChange = (cipher: string, plain: string) => {
    setMappings((prev) => ({
      ...prev,
      [cipher]: plain,
    }));
  };

  const handleClearAll = () => {
    setMappings({});
  };

  // Validation
  const isOverLimit = puzzleText.length > 1000;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Cryptogram Solver
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your cryptogram puzzle and use the mapping grid to decode it.
          </p>
        </header>

        <Form method="get" className="space-y-6">
          {/* PuzzleInput component (T009) */}
          <PuzzleInput
            value={puzzleText}
            onChange={handlePuzzleChange}
            maxLength={1000}
          />

          {/* PuzzleDisplay component (T010) */}
          <PuzzleDisplay
            puzzleText={puzzleText}
            decryptedText={decryptedText}
            mappings={mappings}
          />

          {/* MappingGrid component (T011) */}
          <MappingGrid
            mappings={mappings}
            onMappingChange={handleMappingChange}
            onClearAll={handleClearAll}
            disabled={isOverLimit || !puzzleText}
          />
        </Form>
      </div>
    </div>
  );
}
