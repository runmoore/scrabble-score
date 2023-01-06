import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { createGame, getGame, reopenGame } from "~/models/game.server";
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

export const loader = async ({ params }: LoaderArgs) => {
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

  if (formData.get("action") === "rematch") {
    const userId = await requireUserId(request);

    const players = game.players.map((player) => player.id);

    const newGame = await createGame({ userId, players });

    return redirect(`/games/${newGame.id}/play/${players[0]}`);
  }
};

export default function GamePage() {
  const { game, winners, topScore } = useLoaderData<typeof loader>();
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
    <>
      <h2 className="text-3xl">{title}</h2>
      <div className="my-8 flex justify-around">
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
        <Form method="post" action="">
          <div className="m mt-4 flex flex-col lg:flex-row lg:justify-around">
            <button
              type="submit"
              className="mb-4 rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
              name="action"
              value="reopen"
            >
              Re-open game
            </button>
            <button
              type="submit"
              className="mb-4 rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
              name="action"
              value="rematch"
            >
              Rematch!
            </button>
          </div>
        </Form>
      )}
    </>
  );
}
