import { Form, useSearchParams } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";

export const links: LinksFunction = () => {
  return [{ rel: "manifest", href: "/anagram-manifest.json" }];
};

export default function Anagram() {
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("word");
  const boxes = searchQuery ? searchQuery.split("") : [];
  const distance = Math.max(100, 80 + boxes.length * 5);

  return (
    <>
      <div className="align-center mt-8 flex flex-wrap justify-center">
        <h1 className="text-xxl mb-4 basis-full items-center text-center font-bold">
          Anagram circle generator
        </h1>
        <Form method="get">
          <input
            className="border border-gray-300"
            type="text"
            id="word"
            name="word"
            defaultValue={searchQuery || ""}
          />
          <button type="submit" className="ml-4 rounded-md bg-blue-200 p-2">
            Generate
          </button>
        </Form>
      </div>

      <div
        className="relative mt-8 flex items-center justify-center"
        style={{ height: distance * 3 }}
      >
        {boxes.map((letter, i) => {
          const angle = (360 / boxes.length) * i;

          const transform = `rotate(${angle}deg) translate(${distance}px) rotate(-${angle}deg)`;

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
    </>
  );
}
