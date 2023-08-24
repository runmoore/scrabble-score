import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { getAllPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const players = await getAllPlayers({ userId });

  return json(players);
};

function SelectPlayer({
  players,
  onChange,
}: {
  players: Array<{ id: string; name: string }>;
  onChange: any;
}) {
  return (
    <select onChange={onChange} className="mb-4 border-2">
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
        players={players}
        onChange={(e) => setPlayerOne(e.target.value)}
      />
      <SelectPlayer
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
