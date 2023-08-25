import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";

import { getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const players = await getAllPlayers({ userId });

  return json(players);
};

export const action = async ({ request, params }: ActionArgs) => {
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
    <select name={name} onChange={onChange} className="mb-4 border-2">
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export default function ComparePage() {
  const players = useLoaderData<typeof loader>();
  const [playerOne, setPlayerOne] = useState<string | null>(null);
  const [playerTwo, setPlayerTwo] = useState<string | null>(null);

  return (
    <Form className="flex flex-col" method="post">
      <p className="mb-2">Please select 2 players to compare</p>
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
        className="my-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-200"
        disabled={playerOne === playerTwo}
      >
        Compare players
      </button>
    </Form>
  );
}
