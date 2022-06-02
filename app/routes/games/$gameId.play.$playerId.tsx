import { Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { addScore, getGame, completeGame } from "~/models/game.server";

import invariant from "tiny-invariant";

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { Player, Game, Score } from "~/models/game.server";
import { json } from "@remix-run/node";
import { getNextPlayerToPlay } from "~/game-utils";

interface PlayerWithScores extends Player {
  scores: Score[];
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
  topScore: number;
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
      .map((score) => score);

    player.totalScore = player.scores.reduce(
      (total, current) => (total += current.points),
      0
    );
    game.players[i] = player;
  }

  const topScore = game.players.reduce(
    (max, current) => (current.totalScore > max ? current.totalScore : max),
    0
  );

  return json<LoaderData>({ game, playerId: params.playerId, topScore });
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

    const newScore = await addScore({ score, gameId, playerId });

    game.scores.push(newScore);
    const nextPlayer = getNextPlayerToPlay(game);

    return redirect(`/games/${gameId}/play/${nextPlayer.id}`);
  }

  if (formData.get("action") === "complete") {
    await completeGame(gameId);
    return redirect(`/games/${gameId}/complete`);
  }
};

export default function Play() {
  const { game, playerId, topScore } = useLoaderData() as LoaderData;

  const player = game.players.find((p) => p.id === playerId);

  if (!player) {
    return "oops, bad player id supplied";
  }

  return (
    <>
      <div className="mb-8 flex flex-row justify-evenly text-center">
        {game.players.map((player) => (
          <div key={player.name} className="flex flex-col">
            <span className="font-bold">
              {player.name}{" "}
              {player.totalScore === topScore && player.totalScore > 0
                ? "⭐️"
                : ""}
            </span>
            {player.scores.map((score) => (
              <span key={score.id}>{score.points}</span>
            ))}
            <div className="min-w-[100px] border-t-4 border-b-4 font-bold">
              {player.totalScore}
            </div>
          </div>
        ))}
      </div>
      <h1 className="mb-4">
        It's <span className="font-bold">{player.name}'s</span> turn
      </h1>
      <Form method="post" action="" key={playerId}>
        <input
          className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          type="text"
          name="score"
        />
        <div className="m-4 flex flex-row justify-evenly">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            name="action"
            value="score"
          >
            Submit score
          </button>
          <button
            type="submit"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-blue-400"
            name="action"
            value="complete"
          >
            Complete game
          </button>
        </div>
      </Form>
    </>
  );
}
