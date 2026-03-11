import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";

import {
  addGameType,
  addPlayer,
  createGame,
  getAllGameTypes,
  getAllPlayers,
} from "~/models/game.server";
import { requireUserId } from "~/session.server";
import type { GameType, Player } from "~/models/game.server";
import { useEffect, useState } from "react";
import { Card } from "~/components/Card";

export type LoaderData = {
  players: { id: Player["id"]; name: Player["name"] }[];
  gameTypes: { id: GameType["id"]; name: GameType["name"] }[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const [players, gameTypes] = await Promise.all([
    getAllPlayers({ userId }),
    getAllGameTypes({ userId }),
  ]);

  return json({ players, gameTypes });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "start-new-game": {
      const players = formData.getAll("players") as string[];
      const gameTypeId = (formData.get("gameTypeId") as string) || null;

      if (players.length < 2) {
        throw new Error(`You must select at least 2 players to play`);
      }

      const game = await createGame({ userId, players, gameTypeId });

      return redirect(`/games/${game.id}/play/${players[0]}`);
    }

    case "add-player": {
      const name = (formData.get("name") as string)?.trim();
      if (!name) {
        return json({ errors: "empty name" });
      }
      await addPlayer({ userId, name });

      return json({ errors: "" });
    }

    case "add-game-type": {
      const name = (formData.get("gameTypeName") as string)?.trim();
      if (!name) {
        return json({ errors: "empty game type name" });
      }
      await addGameType({ userId, name });

      return json({ errors: "" });
    }

    default: {
      throw new Error(`Unknown action: ${action}`);
    }
  }
};

export default function NewGamePage() {
  const { players, gameTypes } = useLoaderData<typeof loader>();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showAddGameType, setShowAddGameType] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const gameTypeFetcher = useFetcher<{ errors: string }>();
  const playerFetcher = useFetcher<{ errors: string }>();

  useEffect(() => {
    if (playerFetcher.data?.errors === "") {
      setShowAddPlayer(false);
    }
  }, [playerFetcher.data]);

  useEffect(() => {
    if (gameTypeFetcher.data?.errors === "") {
      setShowAddGameType(false);
    }
  }, [gameTypeFetcher.data]);

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

  const pillBase =
    "cursor-pointer select-none rounded-full px-4 py-2 text-sm font-medium transition-colors";
  const pillUnselected =
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Form method="post" id="new-game-form" className="hidden" />
      <Card title="Game Type">
        {gameTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="mb-2">
              <input
                id="gameType-none"
                type="radio"
                name="gameTypeId"
                value=""
                defaultChecked
                form="new-game-form"
                className="peer sr-only"
              />
              <label
                htmlFor="gameType-none"
                className={`${pillBase} ${pillUnselected} peer-checked:bg-blue-primary peer-checked:text-white`}
              >
                N/A
              </label>
            </div>
            {gameTypes.map((gt) => (
              <div key={gt.id}>
                <input
                  id={`gameType-${gt.id}`}
                  type="radio"
                  name="gameTypeId"
                  value={gt.id}
                  form="new-game-form"
                  className="peer sr-only"
                />
                <label
                  htmlFor={`gameType-${gt.id}`}
                  className={`${pillBase} ${pillUnselected} peer-checked:bg-blue-primary peer-checked:text-white`}
                >
                  {gt.name}
                </label>
              </div>
            ))}
          </div>
        )}
        {gameTypes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No game types yet.
          </p>
        )}
        <div className="mt-3">
          {showAddGameType ? (
            <gameTypeFetcher.Form
              method="post"
              key={`game-type-${gameTypes.length}`}
            >
              <div className="flex items-center gap-2">
                <input
                  name="gameTypeName"
                  aria-label="game type name"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  autoFocus
                />
                <button
                  type="submit"
                  name="action"
                  value="add-game-type"
                  className="rounded-lg bg-green-primary px-3 py-2 text-sm text-white hover:bg-green-secondary"
                >
                  Add
                </button>
              </div>
              {gameTypeFetcher.data?.errors && (
                <span className="mt-1 block text-sm text-red-500 dark:text-red-400">
                  {gameTypeFetcher.data.errors}
                </span>
              )}
            </gameTypeFetcher.Form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddGameType(true)}
              className="text-sm font-medium text-blue-primary hover:underline dark:text-blue-400"
            >
              + Add game type
            </button>
          )}
        </div>
      </Card>

      <Card title="Players">
        {players.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <div key={p.id} className="mb-2">
                <input
                  id={p.id}
                  type="checkbox"
                  name="players"
                  value={p.id}
                  onChange={onPlayerChange}
                  form="new-game-form"
                  className="peer sr-only"
                />
                <label
                  htmlFor={p.id}
                  className={`${pillBase} ${pillUnselected} peer-checked:bg-purple-primary peer-checked:text-white`}
                >
                  {p.name}
                </label>
              </div>
            ))}
          </div>
        )}
        {players.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No players yet. Add at least 2 to start a game.
          </p>
        )}
        <div className="mt-3">
          {showAddPlayer ? (
            <playerFetcher.Form method="post" key={players.length}>
              <div className="flex items-center gap-2">
                <input
                  name="name"
                  aria-label="name"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  autoFocus
                />
                <button
                  type="submit"
                  name="action"
                  value="add-player"
                  className="rounded-lg bg-green-primary px-3 py-2 text-sm text-white hover:bg-green-secondary"
                >
                  Add
                </button>
              </div>
              {playerFetcher.data?.errors && (
                <span className="mt-1 block text-sm text-red-500 dark:text-red-400">
                  {playerFetcher.data.errors}
                </span>
              )}
            </playerFetcher.Form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddPlayer(true)}
              className="text-sm font-medium text-blue-primary hover:underline dark:text-blue-400"
            >
              + Add player
            </button>
          )}
        </div>
        <button
          type="submit"
          name="action"
          value="start-new-game"
          form="new-game-form"
          className="mt-6 w-full rounded-lg bg-green-primary py-3 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-secondary disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
          disabled={selectedPlayers.length < 2}
        >
          {selectedPlayers.length >= 2
            ? `Start Game (${selectedPlayers.length} players)`
            : "Select at least 2 players"}
        </button>
      </Card>
    </div>
  );
}
