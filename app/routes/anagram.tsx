import { Form, useSearchParams } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";

export const links: LinksFunction = () => {
  return [{ rel: "manifest", href: "/anagram-manifest.json" }];
};

// Durstenfeld shuffle algorithm - https://stackoverflow.com/a/12646864/6806381
function shuffleLetters(letters: string[]) {
  const array = [...letters];

  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function queryToBoxes(query: string):string[]{
  return query.split("").map(x => x.trim()).filter(Boolean);
}

export default function Anagram() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = (searchParams.get("word") || "").toLowerCase();

  const [boxes, setBoxes] = useState<string[]>(queryToBoxes(searchQuery));

  // Allows the radius of the circle to scale with the number of boxes
  const radius = Math.max(100, 80 + boxes.length * 5);

  // Ensures we can submit new words without refreshing the page
  useEffect(() => {
    setBoxes(queryToBoxes(searchQuery));
  }, [searchQuery]);

  const clearWord = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("word");
    setSearchParams(newParams);
  };

  return (
    <>
      <div className="align-center mt-8 flex flex-wrap justify-center">
        <h1 className="text-xxl mb-4 basis-full items-center text-center font-bold">
          Anagram circle generator
        </h1>
        <Form method="get" key={searchQuery}>
          <input
            className="border border-gray-300"
            type="text"
            id="word"
            name="word"
            defaultValue={searchQuery}
          />
          <button type="submit" className="ml-4 rounded-md bg-blue-200 p-2">
            Generate
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
        key={boxes.join("")}
        className="relative mt-8 flex items-center justify-center"
        style={{ height: radius * 3 }}
      >
        {boxes.map((letter, i) => {
          const angle = (360 / boxes.length) * i;

          // The first letter is at the top, subsequent letters are rotated clockwise via rotating, moving, then un-rotating to maintain the correct text orientation
          const transform = `rotate(-90deg) rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) rotate(90deg)`;

          return (
            <div
              key={i}
              className="absolute m-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-lg font-bold"
              style={{ transform }}
            >
              {letter}
            </div>
          );
        })}
      </div>
      {searchQuery && (
        <div className="align-center mt-8 flex flex-wrap justify-center">
          <button
            onClick={() => setBoxes(shuffleLetters(boxes))}
            className="ml-4 rounded-md bg-purple-200 p-2"
          >
            Shuffle
          </button>
        </div>
      )}
    </>
  );
}
