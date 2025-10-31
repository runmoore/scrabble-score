import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { addPlayer, createGame, getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import type { Player } from "~/models/game.server";
import { useState } from "react";

export type LoaderData = {
  id: Player["id"];
  name: Player["name"];
}[];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const players = await getAllPlayers({ userId });

  return json(players);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "start-new-game": {
      const players = formData.getAll("players") as string[];

      if (players.length < 2) {
        throw new Error(`You must select at least 2 players to play`);
      }

      const game = await createGame({ userId, players });

      return redirect(`/games/${game.id}/play/${players[0]}`);
    }

    case "add-player": {
      const name = formData.get("name") as string;
      if (!name) {
        return json({ errors: "empty name" });
      }
      await addPlayer({ userId, name });

      return json({ errors: "" });
    }

    default: {
      throw new Error(`Unknown action: ${action}`);
    }
  }
};

export default function NewGamePage() {
  const actionData = useActionData<typeof action>();
  const players = useLoaderData<typeof loader>();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const onPlayerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedPlayers((prev) => {
        return [...prev, event.target.id];
      });
    } else {
      setSelectedPlayers((prev) => {
        return [...prev.filter((x) => x !== event.target.id)];
      });
    }
  };

  return (
    <div className="flex flex-col justify-around lg:flex-row">
      <Form className="flex flex-col" method="post">
        <p className="mb-2 dark:text-gray-200">
          {players.length > 1
            ? "Please select at least 2 players to play:"
            : "Please add more players:"}
        </p>
        {players.map((p) => (
          <div key={p.id} className="mb-2">
            <input
              id={p.id}
              type="checkbox"
              name="players"
              value={p.id}
              onChange={onPlayerChange}
            />
            <label
              htmlFor={p.id}
              className="cursor-pointer pl-8 dark:text-gray-200"
            >
              {p.name}
            </label>
          </div>
        ))}
        <button
          type="submit"
          name="action"
          value="start-new-game"
          className="my-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600"
          disabled={selectedPlayers.length < 2}
        >
          Start new Game
        </button>
      </Form>
      <Form className="flex flex-col" method="post" key={players.length}>
        <input
          name="name"
          aria-label="name"
          className="mt-8 mb-4 border-4 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <span className="text-red-500 dark:text-red-400">
          {actionData?.errors}
        </span>
        <button
          type="submit"
          name="action"
          value="add-player"
          className="rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400 dark:bg-green-700 dark:hover:bg-green-600"
        >
          + Add new player
        </button>
      </Form>
    </div>
  );
}
