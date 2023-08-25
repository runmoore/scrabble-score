import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getAllGames, getGame } from "~/models/game.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.playerOne, "playerOne not found");
  invariant(params.playerTwo, "playerTwo not found");

  const userId = await requireUserId(request);

  const [allGames] = await Promise.all([await getAllGames({ userId })]);

  const relevantGames = await Promise.all(
    allGames
      .filter(
        (game) =>
          game.players.length === 2 &&
          game.players.find((player) => player.id === params.playerOne) &&
          game.players.find((player) => player.id === params.playerTwo)
      )
      .map((game) => getGame({ id: game.id }))
  );

  const playerOne = {
    won: 0,
    name: relevantGames[0]?.players.find(
      (player) => player.id === params.playerOne
    )?.name,
  };

  const playerTwo = {
    won: 0,
    name: relevantGames[0]?.players.find(
      (player) => player.id === params.playerTwo
    )?.name,
  };

  for (const game of relevantGames) {
    if (!game) continue;

    const p1 = game.players.find((player) => player.id === params.playerOne);
    const p2 = game.players.find((player) => player.id === params.playerTwo);

    if (!p1 || !p2) continue;

    if (p1.totalScore > p2.totalScore) {
      playerOne.won++;
    } else if (p1.totalScore < p2.totalScore) {
      playerTwo.won++;
    }
  }

  return json({ playerOne, playerTwo });
};

export default function ComparePlayers() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-3xl font-bold">{`${loaderData.playerOne.name} ${loaderData.playerOne.won} vs ${loaderData.playerTwo.won} ${loaderData.playerTwo.name} `}</h1>
    </>
  );
}
