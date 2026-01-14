import { Form, useNavigate, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";

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

/**
 * Get unique cipher letters from puzzle text (T019)
 * Returns sorted array of unique uppercase letters only
 */
export function getUniqueCipherLetters(puzzleText: string): string[] {
  const letters = new Set<string>();

  for (const char of puzzleText) {
    const upper = char.toUpperCase();
    if (/[A-Z]/.test(upper)) {
      letters.add(upper);
    }
  }

  return Array.from(letters).sort();
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
        className="min-h-30 w-full rounded border border-gray-300 p-4 font-mono text-lg focus:border-blue-primary focus:outline-none focus:ring-2 focus:ring-blue-primary"
        rows={6}
        placeholder="Enter your encrypted puzzle text here..."
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
 * InlineMappingInput Component (T020)
 * Small input box for entering mappings inline above cipher letters
 */
function InlineMappingInput({
  cipherLetter,
  value,
  onChange,
  hasConflict,
  disabled,
}: {
  cipherLetter: string;
  value: string;
  onChange: (plain: string) => void;
  hasConflict: boolean;
  disabled: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="text"
      maxLength={1}
      value={value}
      onChange={(e) => {
        const inputValue = e.target.value.toUpperCase();
        onChange(inputValue);
      }}
      disabled={disabled}
      aria-label={`Inline mapping for ${cipherLetter}`}
      className={`min-h-8 min-w-8 md:min-h-6 md:min-w-6 h-8 w-8 rounded border text-center font-mono text-xs uppercase focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:opacity-50 md:h-6 md:w-6 ${
        hasConflict
          ? "border-red-primary ring-1 ring-red-primary"
          : "border-gray-300 focus:border-blue-primary focus:ring-blue-primary"
      }`}
    />
  );
}

/**
 * PuzzleDisplay Component (T010, enhanced T021)
 * Shows original encrypted text with inline mapping inputs above each letter
 */
function PuzzleDisplay({
  puzzleText,
  mappings,
  onMappingChange,
  disabled,
}: {
  puzzleText: string;
  mappings: Record<string, string>;
  onMappingChange?: (cipher: string, plain: string) => void;
  disabled?: boolean;
}) {
  if (!puzzleText) {
    return null;
  }

  const conflicts = getConflictingLetters(mappings);

  const renderPuzzleText = () => {
    const chars = puzzleText.split("");
    const elements: JSX.Element[] = [];
    let currentWord: JSX.Element[] = [];
    let wordKey = 0;

    const flushWord = () => {
      if (currentWord.length > 0) {
        elements.push(
          <span
            key={`word-${wordKey++}`}
            className="inline-block whitespace-nowrap py-2"
          >
            {currentWord}
          </span>
        );
        currentWord = [];
      }
    };

    chars.forEach((char, index) => {
      const upper = char.toUpperCase();
      const isLetter = /[A-Z]/.test(upper);
      const isSpace = /\s/.test(char);

      if (isSpace) {
        // Flush current word and add space
        flushWord();
        elements.push(
          <span key={`space-${index}`} className="inline">
            {char}
          </span>
        );
      } else if (isLetter) {
        // Add letter to current word
        currentWord.push(
          <span
            key={index}
            className="inline-flex flex-col items-center gap-0 align-bottom"
          >
            <span>
              <InlineMappingInput
                cipherLetter={upper}
                value={mappings[upper] || ""}
                onChange={(plain) => onMappingChange!(upper, plain)}
                hasConflict={conflicts.includes(upper)}
                disabled={disabled || false}
              />
            </span>
            <span className="text-sm text-gray-600">{char}</span>
          </span>
        );
      } else {
        // Punctuation - flush word, add punctuation
        flushWord();
        currentWord.push(
          <span key={index} className="inline">
            {char}
          </span>
        );
        flushWord();
      }
    });

    // Flush any remaining word
    flushWord();

    return elements;
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-700">
        Your Solution (enter guesses above each letter):
      </h3>
      <div
        data-testid="decrypted-text"
        className="whitespace-pre-wrap break-words font-mono text-base"
      >
        {renderPuzzleText()}
      </div>
    </div>
  );
}

/**
 * MappingGrid Component (T011, enhanced T022)
 * Compact 26 letter inputs (A-Z) in responsive flexbox layout for creating cipher-to-plain mappings
 * Fixed-width cells (80px) with center alignment for consistent sizing
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
    <div className="space-y-2" data-testid="mapping-grid">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium">Letter Mappings (A-Z)</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="rounded bg-red-primary px-2 py-1 text-xs text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-primary disabled:opacity-50"
          disabled={disabled}
          aria-label="Clear all mappings"
        >
          Clear All
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap justify-start gap-2">
        {alphabet.map((letter) => {
          const hasConflict = conflicts.includes(letter);
          const value = mappings[letter] || "";

          return (
            <div key={letter} className="w-20 bg-gray-50 p-2 text-center">
              <label
                htmlFor={`mapping-${letter}`}
                className="mb-0.5 block text-[10px] font-medium text-gray-600"
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
                className={`min-h-10 min-w-10 h-10 w-10 rounded border text-center font-mono text-sm uppercase focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:opacity-50 ${
                  hasConflict
                    ? "border-red-primary ring-2 ring-red-primary"
                    : "border-gray-300 focus:border-blue-primary focus:ring-blue-primary"
                }`}
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize from URL params - decode with error handling
  let initialPuzzle = "";
  const puzzleParam = searchParams.get("puzzle");
  if (puzzleParam) {
    try {
      initialPuzzle = decodeURIComponent(puzzleParam);
    } catch {
      // Silent fallback per FR-006
      initialPuzzle = "";
    }
  }

  const [puzzleText, setPuzzleText] = useState(initialPuzzle);
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Write puzzle to URL on change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (puzzleText) {
        navigate(`?puzzle=${encodeURIComponent(puzzleText)}`, {
          replace: true,
        });
      } else {
        navigate("/cryptogram", { replace: true });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [puzzleText, navigate]);

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

          {/* PuzzleDisplay component (T010, enhanced T021) */}
          <PuzzleDisplay
            puzzleText={puzzleText}
            mappings={mappings}
            onMappingChange={handleMappingChange}
            disabled={isOverLimit}
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
