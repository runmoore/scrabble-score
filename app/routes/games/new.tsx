import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";

import { createGame, getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import type { Player } from "~/models/game.server";

type LoaderData = {
  id: Player["id"];
  name: Player["name"];
}[];

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const players = await getAllPlayers({ userId });

  return json<LoaderData>(players);
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const players = formData.getAll("players") as string[];

  const game = await createGame({ userId, players });

  return redirect(`/games/${game.id}/play/${players[0]}`);
};

export default function NewGamePage() {
  const actionData = useActionData() as ActionData;
  const players: LoaderData = useLoaderData();

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <select name="players" multiple>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
      >
        Start new Game
      </button>
    </Form>
  );
}
