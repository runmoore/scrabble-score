import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getGame } from "~/models/game.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.gameId, "gameId not found");
  const game = await getGame({ id: params.gameId });

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  game.players.sort((a, b) => (a.totalScore >= b.totalScore ? -1 : 1));

  return json({ game });
};

export default function GamePage() {
  const { game } = useLoaderData<typeof loader>();

  return (
    <>
      {game.completed ? (
        <h2 className="text-3xl">
          {game.players[0].name} has won with a score of{" "}
          {game.players[0].totalScore}
        </h2>
      ) : (
        <h2 className="text-3xl">"Still Running"</h2>
      )}
      {game.players.map((p) => (
        <p key={p.id}>
          {p.name} {p.totalScore}
        </p>
      ))}
    </>
  );
}
