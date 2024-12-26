import { useState } from "react";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Merry Christmas" }];

const colours = [
  "yellow",
  "blue",
  "cyan",
  "amber",
  "lime",
  "purple",
  "green",
  "red",
];

export default function Toby1() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [count, setCount] = useState(0);
  const [colour, setColour] = useState("red");

  return (
    <div className="align-center mt-8 flex flex-wrap justify-center">
      <h1 className="mb-4 basis-full items-center text-center text-2xl font-bold">
        Hello, Toby
      </h1>
      <div style={{ height: "400px", width: "300px" }}>
        {count <= 5 && (
          <div className="mt-2 mb-2">Press the button to continue</div>
        )}
        {count > 5 && count < 10 && (
          <div className="mt-2 mb-2">Hurry up, what's stopping you?</div>
        )}
        {count >= 10 && <div className="mt-2 mb-2">Nearly there...</div>}

        <Link
          to="/toby-2"
          onClick={(e) => {
            if (count < 15) {
              e.preventDefault();
              setCount(count + 1);
            }
            setX(Math.random() * 200);
            setY(Math.random() * 300);
            setColour(colours[count % colours.length]);
            return;
          }}
          style={{ top: `${y}px`, left: `${x}px` }}
          className={`relative rounded-md bg-${colour}-500 p-2`}
        >
          Button
        </Link>

        {false && (
          <>
            <div className="bg-yellow-500">hello</div>
            <div className="bg-amber-500">hello</div>
            <div className="bg-cyan-500">hello</div>
            <div className="bg-purple-500">hello</div>
            <div className="bg-lime-500">hello</div>
            <div className="bg-orange-500">hello</div>
          </>
        )}
      </div>
    </div>
  );
}
