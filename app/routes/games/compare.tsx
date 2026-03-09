import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";

import { Card } from "~/components/Card";
import type { Player } from "~/models/game.server";
import { getAllGames, getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";

type PlayerSummary = Pick<Player, "id" | "name">;

type Matchup = {
  playerOne: PlayerSummary;
  playerTwo: PlayerSummary;
  gameCount: number;
  gameTypes: string[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const [players, games] = await Promise.all([
    getAllPlayers({ userId }),
    getAllGames({ userId }),
  ]);

  const pairMap = new Map<
    string,
    {
      playerOne: PlayerSummary;
      playerTwo: PlayerSummary;
      gameCount: number;
      gameTypes: Set<string>;
    }
  >();

  for (const game of games) {
    if (!game.completed || game.players.length !== 2) continue;

    const [a, b] =
      game.players[0].id < game.players[1].id
        ? [game.players[0], game.players[1]]
        : [game.players[1], game.players[0]];

    const key = `${a.id}:${b.id}`;
    let entry = pairMap.get(key);
    if (!entry) {
      entry = {
        playerOne: { id: a.id, name: a.name },
        playerTwo: { id: b.id, name: b.name },
        gameCount: 0,
        gameTypes: new Set(),
      };
      pairMap.set(key, entry);
    }

    entry.gameCount++;
    if (game.gameType) {
      entry.gameTypes.add(game.gameType.name);
    }
  }

  const matchups: Matchup[] = Array.from(pairMap.values())
    .sort((a, b) => b.gameCount - a.gameCount)
    .slice(0, 3)
    .map(({ playerOne, playerTwo, gameCount, gameTypes }) => ({
      playerOne,
      playerTwo,
      gameCount,
      gameTypes: Array.from(gameTypes).sort(),
    }));

  return json({ players, matchups });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const playerOne = formData.get("playerOne");
  const playerTwo = formData.get("playerTwo");

  return redirect(`/games/compare/${playerOne}/${playerTwo}`);
};

function SelectPlayer({
  players,
  onChange,
  name,
}: {
  players: Array<{ id: string; name: string }>;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  name: string;
}) {
  return (
    <select
      name={name}
      onChange={onChange}
      className="mb-4 border-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    >
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export default function ComparePage() {
  const { players, matchups } = useLoaderData<typeof loader>();
  const [playerOne, setPlayerOne] = useState<string | null>(null);
  const [playerTwo, setPlayerTwo] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      {matchups.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matchups.map((matchup) => (
            <Card
              key={`${matchup.playerOne.id}:${matchup.playerTwo.id}`}
              title={`${matchup.playerOne.name} vs ${matchup.playerTwo.name}`}
              asLink
              to={`/games/compare/${matchup.playerOne.id}/${matchup.playerTwo.id}`}
              accent
            >
              <p className="dark:text-gray-300">
                {matchup.gameCount === 1
                  ? "1 game"
                  : `${matchup.gameCount} games`}
              </p>
              {matchup.gameTypes.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {matchup.gameTypes.join(", ")}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Form className="flex flex-col" method="post">
        <p className="mb-2 dark:text-gray-200">
          Please select 2 players to compare
        </p>
        <SelectPlayer
          name="playerOne"
          players={players}
          onChange={(e) => setPlayerOne(e.target.value)}
        />
        <SelectPlayer
          name="playerTwo"
          players={players}
          onChange={(e) => setPlayerTwo(e.target.value)}
        />
        <button
          type="submit"
          name="action"
          value="start-new-game"
          className="my-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-gray-700"
          disabled={playerOne === playerTwo}
        >
          Compare players
        </button>
      </Form>
    </div>
  );
}
