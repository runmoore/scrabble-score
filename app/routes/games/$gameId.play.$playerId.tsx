import { Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { addScore, getGame } from "~/models/game.server";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({
  request,
  params,
}: {
  request: Request;
  params: Parameters;
}) => {
  const userId = await requireUserId(request);
  const { gameId, playerId } = params;
  const game = await getGame({ id: gameId });

  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];

    player.scores = game.scores
      .filter((score) => score.playerId === player.id)
      .map((score) => score.points);

    player.totalScore = player.scores.reduce(
      (total, current) => (total += current),
      0
    );
  }
  return { game, playerId };
};

export async function action({ request, params }) {
  const { gameId, playerId } = params;
  const game = await getGame({ id: gameId });

  const formData = await request.formData();

  const score = parseInt(formData.get("score")) || 0;

  if (score > 0) {
    await addScore({ score, gameId, playerId });
  }

  const nextPlayer =
    game.players[1 - game.players.findIndex((p) => p.id === playerId)];

  return redirect(`/games/${gameId}/play/${nextPlayer.id}`);
}

export default function Play() {
  const { game, playerId } = useLoaderData();

  const player = game.players.find((p) => p.id === playerId);

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
        >
          Submit score
        </button>
      </Form>
    </>
  );
}
