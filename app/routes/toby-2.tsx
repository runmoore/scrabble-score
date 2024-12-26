import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Merry Christmas" }];

export default function Toby2() {
  return (
    <div className="align-center mt-8 flex flex-wrap justify-center">
      <h1 className="mb-4 basis-full items-center text-center text-2xl font-bold">
        Congratulations
      </h1>
      <p className="text-center italic">
        There’s a gift that’s hidden, oh so slick,
        <br />
        To find it, you must meet Rick.
        <br />
        By the Christmas tree,
        <br />
        Where the baubles be,
        <br />
        Your treasure lies behind the trick!
        <br />
      </p>
      <div className="animate-scroll-up fixed bottom-0  w-full">
        <img
          className="w-full"
          src="https://i.pinimg.com/736x/e5/4d/7f/e54d7f8f10d090e3f45ac6863f534ebf.jpg"
          alt="Christmas Image"
        />
      </div>
    </div>
  );
}
