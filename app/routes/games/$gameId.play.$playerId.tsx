import { Form, useLoaderData, Link, useNavigation } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import {
  addScore,
  getGame,
  completeGame,
  reopenGame,
} from "~/models/game.server";

import invariant from "tiny-invariant";

import type { EnhancedGame } from "~/models/game.server";
import { json } from "@remix-run/node";
import { getNextPlayerToPlay } from "~/game-utils";
import { useEffect, useState } from "react";

export type LoaderData = typeof loader;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.gameId, "gameId not found");
  invariant(params.playerId, "playerId not found");

  const game = (await getGame({ id: params.gameId })) as EnhancedGame;

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  const topScore = game.players.reduce(
    (max, current) => (current.totalScore > max ? current.totalScore : max),
    0
  );

  return json({ game, playerId: params.playerId, topScore });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
    return redirect(`/games/${gameId}`);
  }

  if (formData.get("action") === "reopen") {
    await reopenGame(gameId);
    return null;
  }
};

export default function Play() {
  const [score, setScore] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const { game, playerId, topScore } = useLoaderData<typeof loader>();

  const player = game.players.find((p) => p.id === playerId);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setScore("");
  }, [playerId]);

  useEffect(() => {
    if (
      navigation.state === "submitting" &&
      navigation.formData?.get("action") === "score"
    ) {
      setScore("");
    }
  }, [navigation.state, navigation.formData]);

  if (!player) {
    return "oops, bad player id supplied";
  }

  const maxNumberOfTurns = game.players.reduce(
    (max, { scores }) => Math.max(max, scores.length),
    0
  );

  return (
    <>
      <div className="mb-8 flex flex-row gap-2 text-center md:gap-4">
        {game.players.map((player) => (
          <div
            key={player.name}
            className={`flex min-w-0 flex-1 flex-col ${
              player.totalScore === topScore && player.totalScore > 0
                ? "rounded-md bg-yellow-100/80"
                : ""
            }`}
          >
            <span
              className={`truncate font-bold ${
                game.players.length > 4 ? "text-xs md:text-base" : ""
              }`}
              title={player.name}
            >
              {player.name}
            </span>
            {player.scores.map((score) => (
              <span key={score.id} className="leading-6">
                {score.points}
              </span>
            ))}
            {new Array(maxNumberOfTurns - player.scores.length)
              .fill(null)
              .map((_, i) => (
                <span key={i} className="leading-6">
                  &nbsp;
                </span>
              ))}
            <div className="border-t-4 border-b-4 px-1 font-bold">
              {player.totalScore}
            </div>
          </div>
        ))}
      </div>
      <h1 className="mb-4">
        It's <span className="font-bold">{player.name}'s</span> turn
      </h1>
      <Form method="post" action="" key={playerId}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (score && !score.startsWith("-")) {
                setScore("-" + score);
              }
            }}
            className="rounded border bg-red-100 px-2 py-1 text-lg text-red-600 hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200"
            disabled={!score || score.startsWith("-")}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              if (score.startsWith("-")) {
                setScore(score.slice(1));
              }
            }}
            className="rounded border bg-green-100 px-2 py-1 text-lg text-green-600 hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200"
            disabled={!score || !score.startsWith("-")}
          >
            +
          </button>
          <input
            className="flex-1 rounded border border-gray-500 px-2 py-1 text-lg"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            name="score"
            aria-label="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            autoFocus
          />
        </div>
        <div className="m mt-4 flex flex-col lg:flex-row lg:justify-around">
          {!game.completed && (
            <button
              type="submit"
              className="mb-4 min-w-[128px] rounded bg-blue-primary py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-200"
              name="action"
              value="score"
              disabled={(hasMounted && !score) || isSubmitting}
            >
              {isSubmitting ? "..." : "Submit score"}
            </button>
          )}
          {!game.completed && (
            <button
              type="submit"
              className="mb-4 rounded bg-green-primary py-2 px-4 text-white hover:bg-green-secondary focus:bg-green-secondary"
              name="action"
              value="complete"
            >
              Complete game
            </button>
          )}
          {game.completed && (
            <button
              type="submit"
              className="mb-4 rounded bg-green-primary py-2 px-4 text-white hover:bg-green-secondary focus:bg-green-secondary"
              name="action"
              value="reopen"
            >
              Re-open game
            </button>
          )}
          {!game.completed &&
            game.players
              .filter((p) => p.id !== playerId)
              .map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className="mb-4 rounded bg-purple-primary py-2 px-4 text-white hover:bg-purple-secondary focus:bg-purple-secondary"
                >
                  <Link to={`/games/${game.id}/play/${p.id}`}>
                    Switch to {p.name}'s turn
                  </Link>
                </button>
              ))}
        </div>
      </Form>
    </>
  );
}
