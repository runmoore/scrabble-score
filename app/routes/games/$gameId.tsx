import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import type { Game } from "~/models/game.server";
import { getGame } from "~/models/game.server";

type LoaderData = {
  game: Game;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const game = await getGame({ id: params.gameId });

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ game });
};

export default function GamePage() {
  const { game } = useLoaderData() as LoaderData;

  return (
    <>
      <h2>Players</h2>
      {game.players.map((p) => (
        <p key={p.id}>{p.name}</p>
      ))}
    </>
  );
}
