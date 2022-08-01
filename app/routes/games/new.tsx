import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";

import { addPlayer, createGame, getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import type { Player } from "~/models/game.server";

export type LoaderData = {
  id: Player["id"];
  name: Player["name"];
}[];

type ActionData = {
  errors: string;
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const players = await getAllPlayers({ userId });

  return json(players);
};

export const action = async ({ request }: ActionArgs) => {
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
  const players = useLoaderData<typeof loader>();

  return (
    <div className="flex justify-around">
      <Form className="flex flex-col" method="post">
        {players.map((p) => (
          <div key={p.id} className="mb-2">
            <input id={p.id} type="checkbox" name="players" value={p.id} />
            <label htmlFor={p.id} className="cursor-pointer pl-8">
              {p.name}
            </label>
          </div>
        ))}
        <button
          type="submit"
          name="action"
          value="start-new-game"
          className="mt-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
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
