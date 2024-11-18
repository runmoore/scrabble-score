import { Form, useSearchParams } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";

export const links: LinksFunction = () => {
  return [{ rel: "manifest", href: "/anagram-manifest.json" }];
};

const SIZE_OF_LETTER = 48;

// Durstenfeld shuffle algorithm - https://stackoverflow.com/a/12646864/6806381
function shuffleLetters(letters: string[]) {
  const array = [...letters];

  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function queryToLetters(query: string): string[] {
  return query
    .split("")
    .map((x) => x.trim())
    .filter(Boolean);
}

// Allows the radius of the circle to scale with the number of letters
function generateRadius(count: number): number {
  if (count === 1) return 0;

  const desiredCircumfrence = count * SIZE_OF_LETTER;
  const radius = desiredCircumfrence / (2 * Math.PI);
  return radius;
}

function Letter({
  radius,
  angle,
  letter,
  onClick = () => {},
}: {
  radius: number;
  angle: number;
  letter: string;
  onClick?: (dismissed: boolean) => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  // The first letter is at the top, subsequent letters are rotated clockwise via rotating, moving, then un-rotating to maintain the correct text orientation
  const transform = `rotate(-90deg) rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) rotate(90deg)`;
  const dismissedStyle = dismissed ? "text-gray-300" : "";
  return (
    <div
      className={`absolute m-4 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-lg font-bold ${dismissedStyle}`}
      style={{ transform }}
      onClick={() => {
        setDismissed(!dismissed);
        onClick(!dismissed);
      }}
    >
      {letter}
    </div>
  );
}

export default function Anagram() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = (searchParams.get("word") || "").toLowerCase();

  const [letters, setLetters] = useState<string[]>(queryToLetters(searchQuery));
  const [newWord, setNewWord] = useState<string[]>([]);

  const radius = generateRadius(letters.length);

  // Ensures we can submit new words without refreshing the page
  useEffect(() => {
    setLetters(queryToLetters(searchQuery));
    setNewWord([]);
  }, [searchQuery]);

  const clearWord = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("word");
    setSearchParams(newParams);
  };

  const shuffle = () => {
    setLetters(shuffleLetters(letters));
    setNewWord([]);
  };

  return (
    <>
      <div className="align-center mt-8 flex flex-wrap justify-center">
        <h1 className="text-xxl mb-4 basis-full items-center text-center font-bold">
          Anagram circle generator
        </h1>
        <Form method="get" key={searchQuery}>
          <input
            className="w-36 border border-gray-300"
            type="text"
            id="word"
            name="word"
            defaultValue={searchQuery}
          />
          <button type="submit" className="ml-4 rounded-md bg-blue-200 p-2">
            Go
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={clearWord}
              className="absolute ml-4 rounded-md bg-red-200 p-2"
            >
              ❌
            </button>
          )}
        </Form>
      </div>

      <div
        key={letters.join("")}
        className="relative mt-8 flex items-center justify-center bg-gray-100 "
        style={{ height: radius * 2 + SIZE_OF_LETTER }}
      >
        {letters.map((letter, i) => {
          const angle = (360 / letters.length) * i;

          return (
            <Letter
              key={`${angle}${letter}`}
              radius={radius}
              angle={angle}
              letter={letter}
              onClick={(dismissed) => {
                if (dismissed) {
                  setNewWord([...newWord, letter]);
                } else {
                  let found = false;
                  setNewWord(newWord.filter((x) => {
                    if (!found && x === letter) {
                      found = true;
                      return false;
                    }
                    return true;
                  }));
                }
              }}
            />
          );
        })}
      </div>
      {searchQuery && (
        <div className="align-center mt-8 flex flex-wrap justify-center">
          <button
            onClick={shuffle}
            className="ml-4 rounded-md bg-purple-200 p-2"
          >
            Shuffle
          </button>
        </div>
      )}
      {searchQuery && (
        <div className="align-center mt-8 flex flex-wrap justify-center">
          {[
            ...newWord,
            ...new Array(Math.max(0, searchQuery.length - newWord.length)),
          ].map((letter, i) => (
            <div
              key={i}
              className="m-2 flex h-4 w-4 items-center justify-center border border-white border-b-gray-500 pb-2"
            >
              {letter}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
