import { Form, Link, useSearchParams } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";

export const links: LinksFunction = () => {
  return [{ rel: "manifest", href: "/anagram-manifest.json" }];
};

const SIZE_OF_LETTER = 48;

type Letter = {
  character: string;
  isDismissed: boolean;
};

// Durstenfeld shuffle algorithm - https://stackoverflow.com/a/12646864/6806381
function shuffleLetters(letters: Array<Letter>): Array<Letter> {
  const array = [...letters];

  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function sanitiseQuery(query: string): string {
  return query
    .split("")
    .map((x) => x.trim())
    .filter(Boolean)
    .join("");
}

function queryToBlankNewWord(query: string): string[] {
  return new Array(sanitiseQuery(query).length).fill("");
}

function queryToLetters(query: string): Array<Letter> {
  return sanitiseQuery(query)
    .split("")
    .map((character) => ({ character, isDismissed: false }));
}

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
  onClick?: (dismissed: boolean) => void;
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
      onClick={() => {
        onClick(!isDismissed);
      }}
    >
      {letter}
    </div>
  );
}

function findNextBlankLetter(word: string[], startIndex: number): number {
  let count = 0;
  let index = startIndex;
  while (count < word.length) {
    if (word[index] === "") {
      return index;
    } else {
      index = (index + 1) % word.length;
    }
    count++;
  }
  return -1;
}

export default function Anagram() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = (searchParams.get("word") || "").toLowerCase();

  const [letters, setLetters] = useState<Array<Letter>>(
    queryToLetters(searchQuery)
  );
  const [newWord, setNewWord] = useState<string[]>(
    queryToBlankNewWord(searchQuery)
  );

  const [indexOfNewWord, setIndexOfNewWord] = useState(0);
  const [recentAnagrams, setRecentAnagrams] = useState<string[]>([]);

  const radius = generateRadius(letters.length);

  // Ensures we can submit new words without refreshing the page
  useEffect(() => {
    setLetters(queryToLetters(searchQuery));
    setNewWord(queryToBlankNewWord(searchQuery));
    setIndexOfNewWord(0);

    // Add new search query to recent anagrams when it changes
    if (searchQuery) {
      setRecentAnagrams((prev) => {
        if (prev.includes(searchQuery)) {
          return prev;
        }
        return [searchQuery, ...prev];
      });
    }
  }, [searchQuery]);

  const clearWord = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("word");
    setSearchParams(newParams);
    setIndexOfNewWord(0);
  };

  const shuffle = () => {
    setLetters(shuffleLetters(letters));
  };

  const clearNewWord = () => {
    setIndexOfNewWord(0);
    setNewWord(queryToBlankNewWord(searchQuery));
    setLetters((value) =>
      value.map((letter) => ({ ...letter, isDismissed: false }))
    );
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
                        : "border-gray-300 bg-transparent text-gray-700 hover:border-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400"
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
              onClick={(isDismissed) => {
                const updatedLetters = [...letters];
                updatedLetters[i].isDismissed = isDismissed;
                setLetters(updatedLetters);

                if (isDismissed) {
                  let updatedWord = [...newWord];
                  updatedWord[indexOfNewWord] = character;

                  setNewWord(updatedWord);
                  setIndexOfNewWord(
                    findNextBlankLetter(updatedWord, indexOfNewWord)
                  );
                } else {
                  const index = newWord.lastIndexOf(character);

                  if (index > -1) {
                    const updatedWord = [...newWord];
                    updatedWord[index] = "";
                    setNewWord(updatedWord);

                    setIndexOfNewWord(index);
                  }
                }
              }}
            />
          );
        })}
      </div>
      {searchQuery && (
        <div>
          <div className="align-center mt-8 flex flex-wrap justify-center dark:text-gray-100">
            ({newWord.length})
          </div>
          <div className="align-center mt-8 flex flex-wrap justify-center">
            <button
              onClick={shuffle}
              className="ml-4 rounded-2xl border border-black bg-gray-100 p-2 text-gray-700 dark:border-gray-400 dark:bg-gray-800 dark:text-gray-200"
            >
              Shuffle
            </button>
            <button
              onClick={clearNewWord}
              className="ml-4 rounded-2xl border border-black bg-gray-100 p-2 text-gray-700 dark:border-gray-400 dark:bg-gray-800 dark:text-gray-200"
            >
              Clear
            </button>
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
              onClick={() => {
                if (newWord[i] !== "") {
                  // We've clicked on a letter that's already been placed, so we should remove it
                  let updatedWord = [...newWord];
                  updatedWord[i] = "";
                  setNewWord(updatedWord);

                  const updatedLetters = [...letters];
                  const index = updatedLetters.findIndex(
                    ({ character, isDismissed }) =>
                      character === newWord[i] && isDismissed
                  );
                  updatedLetters[index].isDismissed = false;
                }
                setIndexOfNewWord(i);
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
