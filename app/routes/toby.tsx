import { Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";

const errors = [
  "Sorry, please try again",
  "Uh oh, wrong name",
  "All the information is on the page",
  "Wrong. 5th time lucky?",
  "I didn't expect you to be this bad",
];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const count = Number.parseInt(formData.get("count") as string);

  if (name.toLowerCase().replace(" ", "") === "yourname") {
    return redirect("/toby-1");
  } else if (name.toLowerCase() === "your name to continue") {
    return json(
      { errors: { name: "You're too clever for your own good" } },
      { status: 400 }
    );
  } else {
    return json({ errors: { name: errors[count] } }, { status: 400 });
  }
};

export default function Toby() {
  const actionData = useActionData() as { errors?: { name: string} };
  const [count, setCount] = useState(-1);

  return (
    <div className="align-center mt-8 flex flex-wrap justify-center">
      <h1 className="mb-4 basis-full items-center text-center text-xl font-bold">
        Merry Christmas
      </h1>
      <Form method="post">
        <div>
          <label htmlFor="name">Please enter your name to continue</label>
        </div>
        <div>
          <input
            type="text"
            name="name"
            id="name"
            className="w-36 border border-gray-300"
          />
          <input hidden type="text" name="count" id="count" value={count} />

          <button
            type="submit"
            className="ml-4 rounded-md bg-red-500 p-2 text-white"
            onClick={() => setCount((count + 1) % errors.length)}
          >
            Go
          </button>
        </div>
        {actionData?.errors?.name && (
          <div className="pt-1 text-red-primary" id="email-error">
            {actionData.errors.name}
          </div>
        )}
      </Form>
    </div>
  );
}
