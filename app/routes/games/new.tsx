import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";

import { addPlayer, createGame, getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import type { Player } from "~/models/game.server";

type LoaderData = {
  id: Player["id"];
  name: Player["name"];
}[];

type ActionData = {
  errors: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const players = await getAllPlayers({ userId });

  return json<LoaderData>(players);
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "start-new-game": {
      const players = formData.getAll("players") as string[];

      const game = await createGame({ userId, players });

      return redirect(`/games/${game.id}/play/${players[0]}`);
    }

    case "add-player": {
      const name = formData.get("name") as string;
      if (!name) {
        return json<ActionData>({ errors: "empty name" });
      }
      await addPlayer({ userId, name });

      return "";
    }

    default: {
      throw new Error(`Unknown action: ${action}`);
    }
  }
};

export default function NewGamePage() {
  const actionData = useActionData() as ActionData;
  const players: LoaderData = useLoaderData();

  return (
    <div className="flex justify-around">
      <Form className="flex flex-col" method="post">
        <select name="players" multiple className="mb-8 border-4">
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          name="action"
          value="start-new-game"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Start new Game
        </button>
      </Form>
      <Form className="flex flex-col" method="post" key={players.length}>
        <input name="name" className="mb-8 border-4" />
        <span className="text-red-500">{actionData?.errors}</span>
        <button
          type="submit"
          name="action"
          value="add-player"
          className="rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
        >
          + Add new player
        </button>
      </Form>
    </div>
  );
}
