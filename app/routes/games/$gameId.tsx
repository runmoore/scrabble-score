import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { Game, Player, Score } from "~/models/game.server";
import { getGame } from "~/models/game.server";

type LoaderData = {
  game: {
    id: Game["id"];
    players: Player[];
    scores: Score[];
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.gameId, "gameId not found");
  const game  = await getGame({ id: params.gameId });

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
