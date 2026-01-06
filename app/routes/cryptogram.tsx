import { Form, useSearchParams } from "@remix-run/react";
import { useMemo, useState } from "react";

// =============================================================================
// TYPE DEFINITIONS (T007)
// =============================================================================

/**
 * Main state container for the cryptogram solver
 */
interface CryptogramState {
  // The original encrypted puzzle text (immutable after input)
  puzzleText: string;

  // Letter mappings: cipher letter (uppercase) → plain letter (uppercase)
  // Example: { "Q": "E", "W": "T", "X": "A" }
  mappings: Record<string, string>;

  // Whether the hint system panel is visible (Phase 4 - User Story 2)
  hintsVisible: boolean;
}

/**
 * Individual cipher-to-plain letter association (for UI rendering)
 */
interface LetterMapping {
  // Cipher letter (always uppercase A-Z)
  cipher: string;

  // Plain letter (always uppercase A-Z, or empty string if not mapped)
  plain: string;

  // Whether this mapping conflicts with another
  // (multiple cipher letters mapped to same plain letter)
  hasConflict: boolean;
}

// =============================================================================
// HELPER FUNCTIONS (T008 - will be implemented next)
// =============================================================================

// TODO: Add helper functions

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
          <span className="text-red-primary font-medium">
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

// =============================================================================
// MAIN COMPONENT (T013 - will be implemented next)
// =============================================================================

export default function Cryptogram() {
  const [searchParams] = useSearchParams();
  const initialPuzzle = searchParams.get("puzzle") || "";

  // Basic state for testing components built so far
  const [puzzleText, setPuzzleText] = useState(initialPuzzle);
  const [mappings] = useState<Record<string, string>>({});

  // Placeholder for decrypted text (will use applyMappings helper once T008 is done)
  const decryptedText = puzzleText; // TODO: Replace with applyMappings(puzzleText, mappings)

  const handlePuzzleChange = (value: string) => {
    setPuzzleText(value);
  };

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

          <p className="text-gray-500 text-sm">
            Note: Mapping grid and helper functions not yet implemented.
          </p>
        </Form>
      </div>
    </div>
  );
}
