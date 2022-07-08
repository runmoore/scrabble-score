import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { Game, Score, PlayerWithScores } from "~/models/game.server";
import { getGame } from "~/models/game.server";

type LoaderData = {
  game: {
    id: Game["id"];
    completed: Game["completed"];
    players: PlayerWithScores[];
    scores: Score[];
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.gameId, "gameId not found");
  const game = await getGame({ id: params.gameId });

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  game.players.sort((a, b) => (a.totalScore >= b.totalScore ? -1 : 1));

  return json<LoaderData>({ game });
};

export default function GamePage() {
  const { game } = useLoaderData() as LoaderData;

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
