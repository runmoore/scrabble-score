import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useRef } from "react";
import invariant from "tiny-invariant";

import {
  createGame,
  deleteGame,
  getGame,
  reopenGame,
} from "~/models/game.server";
import { getNextPlayerToPlay } from "~/game-utils";
import { requireUserId } from "~/session.server";

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes = {
  zero: "",
  one: "st",
  two: "nd",
  few: "rd",
  many: "",
  other: "th",
};

function getNumberWithOrdinal(n: number) {
  const category = english_ordinal_rules.select(n);
  const suffix = suffixes[category];
  return n + suffix;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.gameId, "gameId not found");
  const game = await getGame({ id: params.gameId });

  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  game.players.sort((a, b) => (a.totalScore >= b.totalScore ? -1 : 1));

  for (const [i, player] of game.players.entries()) {
    if (i === 0) {
      player.place = 1;
    } else if (player.totalScore === game.players[i - 1].totalScore) {
      player.place = game.players[i - 1].place;
    } else {
      player.place = i + 1;
    }
  }

  const topScore = game.players[0].totalScore;
  const winners = game.players.filter(
    ({ totalScore }) => totalScore === topScore
  );
  return json({ game, winners, topScore });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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

  if (formData.get("action") === "rematch") {
    const userId = await requireUserId(request);

    const players = game.players.map((player) => player.id);
    const gameTypeId = game.gameType?.id ?? null;

    const newGame = await createGame({ userId, players, gameTypeId });

    return redirect(`/games/${newGame.id}/play/${players[0]}`);
  }

  if (formData.get("action") === "delete") {
    const userId = await requireUserId(request);

    await deleteGame({ id: gameId, userId });

    return redirect("/games");
  }
};

export default function GamePage() {
  const { game, winners, topScore } = useLoaderData<typeof loader>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  let title = "Still Playing";

  if (game.completed) {
    if (winners.length === 1) {
      title = `${game.players[0].name} has won with a score of ${topScore}`;
    } else if (winners.length < game.players.length) {
      const listOfWinners = winners.map(({ name }) => name).join(" and ");
      title = `It's a draw! ${listOfWinners} have won with a score of ${topScore}`;
    } else {
      title = `It's a draw! Everyone has a score of ${topScore}`;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {game.gameType && (
        <h2 className="mb-2 text-xl font-bold dark:text-gray-100">
          {game.gameType.name}
        </h2>
      )}
      <h2 className="text-3xl dark:text-gray-100">{title}</h2>
      <div className="my-8 flex justify-around dark:text-gray-200">
        <div>
          {game.players.map((p) => (
            <p key={p.id}>
              {getNumberWithOrdinal(p.place)} {p.place === 1 && "🏆"}
            </p>
          ))}
        </div>
        <div>
          {game.players.map((p) => (
            <p key={p.id}>{p.name}</p>
          ))}
        </div>
        <div>
          {game.players.map((p) => (
            <p key={p.id}>{p.totalScore}</p>
          ))}
        </div>
      </div>
      {game.completed && (
        <>
          <Form method="post" action="">
            <div className="m mt-4 flex flex-col lg:flex-row lg:justify-around">
              <button
                type="submit"
                className="mb-4 rounded bg-green-primary py-2 px-4 text-white hover:bg-green-secondary focus:bg-green-secondary"
                name="action"
                value="reopen"
              >
                Re-open game
              </button>
              <button
                type="submit"
                className="mb-4 rounded bg-purple-primary py-2 px-4 text-white hover:bg-purple-secondary focus:bg-purple-secondary"
                name="action"
                value="rematch"
              >
                Rematch!
              </button>
            </div>
          </Form>
          <div className="mt-auto">
            <button
              type="button"
              className="mt-4 w-full rounded bg-red-primary py-3 px-4 text-white"
              onClick={() => dialogRef.current?.showModal()}
            >
              Delete game
            </button>
          </div>
          <dialog
            ref={dialogRef}
            className="rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800"
            onClick={(e) => {
              if (e.target === dialogRef.current) {
                dialogRef.current.close();
              }
            }}
          >
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                Delete Game?
              </h3>
              <p className="mb-6 dark:text-gray-300">
                Are you sure you want to delete this game? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded bg-gray-200 py-2 px-4 text-gray-800 hover:bg-gray-300 focus:bg-gray-300"
                  onClick={() => dialogRef.current?.close()}
                >
                  Cancel
                </button>
                <Form method="post">
                  <button
                    type="submit"
                    className="rounded bg-red-primary py-2 px-4 text-white hover:bg-red-secondary focus:bg-red-secondary"
                    name="action"
                    value="delete"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          </dialog>
        </>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <div className="dark:text-gray-200">Game not found</div>;
    } else {
      return (
        <div className="dark:text-gray-200">
          <h1>Oops</h1>
          <p>Status: {error.status}</p>
          <p>{error.data.message}</p>
        </div>
      );
    }
  }

  return (
    <div className="dark:text-gray-200">
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      {/* @ts-ignore */}
      <pre>{error?.message}</pre>
    </div>
  );
}
