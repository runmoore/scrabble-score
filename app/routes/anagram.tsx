import { Form, Link, useSearchParams } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { useEffect, useRef, useState } from "react";

import { ActionButton } from "~/components/ActionButton";
import { useAnagramState } from "~/hooks/useAnagramState";

export const links: LinksFunction = () => {
  return [{ rel: "manifest", href: "/anagram-manifest.json" }];
};

const SIZE_OF_LETTER = 48;

// Allows the radius of the circle to scale with the number of letters
function generateRadius(count: number): number {
  if (count === 1) return 0;

  const desiredCircumference = count * SIZE_OF_LETTER;
  const radius = desiredCircumference / (2 * Math.PI);
  return radius;
}

function Letter({
  radius,
  angle,
  letter,
  id,
  isDismissed,
  onClick = () => {},
}: {
  radius: number;
  angle: number;
  letter: string;
  id: string;
  isDismissed: boolean;
  onClick?: () => void;
}) {
  // The first letter is at the top, subsequent letters are rotated clockwise via rotating, moving, then un-rotating to maintain the correct text orientation
  const transform = `rotate(-90deg) rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) rotate(90deg)`;
  const dismissedStyle = isDismissed
    ? "text-gray-300 dark:text-gray-600"
    : "dark:text-gray-100";
  return (
    <div
      data-testid={id}
      className={`letter absolute m-4 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-lg font-bold ${dismissedStyle}`}
      style={{ transform }}
      onClick={onClick}
    >
      {letter}
    </div>
  );
}

export default function Anagram() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = (searchParams.get("word") || "").toLowerCase();

  const {
    letters,
    newWord,
    indexOfNewWord,
    undoStack,
    placeLetter,
    removeLetter,
    undo,
    clear,
    shuffle,
    goToNextBlank,
  } = useAnagramState(searchQuery);

  const [recentAnagrams, setRecentAnagrams] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const radius = generateRadius(letters.length);

  useEffect(() => {
    // Add new search query to recent anagrams when it changes
    if (searchQuery) {
      setRecentAnagrams((prev) => {
        if (prev.includes(searchQuery)) {
          return prev;
        }
        return [searchQuery, ...prev];
      });
    } else {
      // Focus input when query is cleared
      inputRef.current?.focus();
    }
  }, [searchQuery]);

  const clearWord = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("word");
    setSearchParams(newParams);
  };

  return (
    <>
      <div className="align-center mt-8 flex flex-wrap justify-center">
        <h1 className="text-xxl mb-4 basis-full items-center text-center font-bold dark:text-gray-100">
          Anagram circle generator
        </h1>

        {recentAnagrams.length > 0 && (
          <div className="mb-4 w-full px-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentAnagrams.map((anagram, index) => {
                const isActive = anagram === searchQuery;
                return (
                  <div
                    key={`${anagram}-${index}`}
                    className={`flex flex-shrink-0 items-center gap-2 rounded-full border-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-gray-800 bg-gray-800 text-white dark:border-gray-200 dark:bg-gray-200 dark:text-gray-900"
                        : "bg-transparent border-gray-300 text-gray-700 hover:border-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setRecentAnagrams((prev) =>
                          prev.filter((a) => a !== anagram)
                        );
                      }}
                      className="ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label={`Remove ${anagram}`}
                    >
                      ✕
                    </button>
                    <Link
                      to={`?word=${encodeURIComponent(anagram)}`}
                      className="flex-grow py-2 pr-4"
                    >
                      {anagram}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Form method="get" key={searchQuery}>
          <input
            ref={inputRef}
            className="w-36 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            type="text"
            id="word"
            name="word"
            aria-label="word"
            defaultValue={searchQuery}
            autoCapitalize="none"
            spellCheck="false"
            autoCorrect="off"
            autoComplete="off"
          />
          <button
            type="submit"
            className="ml-4 rounded-md bg-blue-200 p-2 dark:bg-blue-700 dark:text-white"
          >
            Go
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={clearWord}
              className="absolute ml-4 rounded-md bg-red-200 p-2 dark:bg-red-700 dark:text-white"
            >
              ❌
            </button>
          )}
        </Form>
      </div>

      <div
        key={letters.join("")}
        className="relative mt-8 flex items-center justify-center bg-gray-100 dark:bg-gray-900"
        style={{ height: radius * 2 + SIZE_OF_LETTER }}
      >
        {letters.map(({ character, isDismissed }, i) => {
          const angle = (360 / letters.length) * i;

          return (
            <Letter
              key={`${angle}${character}`}
              radius={radius}
              angle={angle}
              letter={character}
              id={`letter${i}`}
              isDismissed={isDismissed}
              onClick={
                isDismissed
                  ? () => removeLetter(newWord.lastIndexOf(character))
                  : () => placeLetter(i)
              }
            />
          );
        })}
      </div>
      {searchQuery && (
        <div>
          <div className="align-center mt-8 flex flex-wrap justify-center dark:text-gray-100">
            ({newWord.length})
          </div>
          <div className="align-center mt-8 flex flex-wrap justify-center gap-4">
            <ActionButton onClick={shuffle}>Shuffle</ActionButton>
            <ActionButton onClick={clear}>Clear</ActionButton>
            <ActionButton
              onClick={goToNextBlank}
              disabled={newWord.filter((letter) => letter === "").length < 2}
            >
              Next
            </ActionButton>
            <ActionButton onClick={undo} disabled={undoStack.length === 0}>
              Undo
            </ActionButton>
          </div>
        </div>
      )}
      {searchQuery && (
        <div className="align-center mt-8 flex flex-wrap justify-center">
          {newWord.map((letter, i) => (
            <div
              key={i}
              className={`m-2 flex h-4 w-4 cursor-pointer items-center justify-center border-b-2 pl-2 pr-2 pb-2 leading-normal dark:text-gray-100 ${
                indexOfNewWord === i
                  ? "border-b-red-500 dark:border-b-red-400"
                  : "border-b-gray-500 dark:border-b-gray-400"
              }`}
              onClick={() => removeLetter(i)}
            >
              {letter}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
