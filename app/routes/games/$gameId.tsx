import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getGame, reopenGame } from "~/models/game.server";
import { getNextPlayerToPlay } from "~/game-utils";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.gameId, "gameId not found");
  const game = await getGame({ id: params.gameId });

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  game.players.sort((a, b) => (a.totalScore >= b.totalScore ? -1 : 1));

  return json({ game });
};

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.gameId, "gameId not found");
  const { gameId } = params;

  const game = await getGame({ id: params.gameId });
  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();

  if (formData.get("action") === "reopen") {
    await reopenGame(gameId);

    const nextPlayer = getNextPlayerToPlay(game);

    return redirect(`/games/${gameId}/play/${nextPlayer.id}`);
  }
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
        <h2 className="text-3xl">Still Playing</h2>
      )}
      {game.players.map((p) => (
        <p key={p.id}>
          {p.name} {p.totalScore}
        </p>
      ))}
      {game.completed && (
        <Form method="post" action="">
          <button
            type="submit"
            className="rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
            name="action"
            value="reopen"
          >
            Re-open game
          </button>
        </Form>
      )}
    </>
  );
}
