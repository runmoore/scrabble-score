import { Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { addScore, getGame, completeGame } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { Player, Game, Score } from "~/models/game.server";
import { json } from "@remix-run/node";
import { getNextPlayerToPlay } from "~/game-utils";

interface PlayerWithScores extends Player {
  scores: number[];
  totalScore: number;
}

type EnhancedGame = {
  id: Game["id"];
  scores: Score[];
  players: PlayerWithScores[];
};


type LoaderData = {
  game: EnhancedGame;
  playerId: Player["id"];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.gameId, "gameId not found");
  invariant(params.playerId, "playerId not found");

  const game = (await getGame({ id: params.gameId })) as EnhancedGame;

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  for (let i = 0; i < game.players.length; i++) {
    const player: PlayerWithScores = {
      ...game.players[i],
      scores: [],
      totalScore: 0,
    };

    player.scores = game.scores
      .filter((score) => score.playerId === player.id)
      .map((score) => score.points);

    player.totalScore = player.scores.reduce(
      (total, current) => (total += current),
      0
    );

    game.players[i] = player;
  }
  return json<LoaderData>({ game, playerId: params.playerId });
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.gameId, "gameId not found");
  invariant(params.playerId, "playerId not found");
  const { gameId, playerId } = params;

  const game = await getGame({ id: params.gameId });
  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();

  if (formData.get("action") === "score") {
    const score = parseInt(formData.get("score") as string) || 0;

    if (score > 0) {
      await addScore({ score, gameId, playerId });
    }

    const nextPlayer = getNextPlayerToPlay(game);

    return redirect(`/games/${gameId}/play/${nextPlayer.id}`);
  }

  if (formData.get("action") === "complete") {
    await completeGame(gameId);
    return redirect(`/games/${gameId}/complete`);
  }
};

export default function Play() {
  const { game, playerId } = useLoaderData() as LoaderData;

  const player = game.players.find((p) => p.id === playerId);

  if (!player) {
    return "oops, bad player id supplied";
  }

  return (
    <>
      <h1>It's {player.name}'s turn</h1>
      <table>
        <thead>
          <tr>
            {game.players.map((player) => (
              <th key={player.name}>{player.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {game.players.map((player) => (
              <td key={player.name}>{player.totalScore}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <Form method="post" action="" key={playerId}>
        <input
          className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          type="text"
          name="score"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          name="action"
          value="score"
        >
          Submit score
        </button>
      </Form>
      <Form method="post" action="">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          name="action"
          value="complete"
        >
          Complete game
        </button>
      </Form>
    </>
  );
}
