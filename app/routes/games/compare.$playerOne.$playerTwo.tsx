import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { PlayerWithScores } from "~/models/game.server";
import { getAllGames, getGame, getPlayer } from "~/models/game.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.playerOne, "playerOne not found");
  invariant(params.playerTwo, "playerTwo not found");

  const userId = await requireUserId(request);

  const [playerOneName, playerTwoName, allGames] = await Promise.all([
    (await getPlayer({ id: params.playerOne }))?.name,
    (await getPlayer({ id: params.playerTwo }))?.name,
    await getAllGames({ userId }),
  ]);

  const relevantGames = (
    await Promise.all(
      allGames
        .filter(
          (game) =>
            game.players.length === 2 &&
            game.players.find((player) => player.id === params.playerOne) &&
            game.players.find((player) => player.id === params.playerTwo)
        )
        .map((game) => getGame({ id: game.id }))
      // flatMap to remove the nulls and be TS safe
    )
  ).flatMap((game) => (game ? [game] : []));

  const playerOne = {
    won: 0,
    name: playerOneName,
  };

  const playerTwo = {
    won: 0,
    name: playerTwoName,
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

  return json({ playerOne, playerTwo, relevantGames });
};

const getWinnersNames = (game: {
  players: Array<Pick<PlayerWithScores, "totalScore" | "name">>;
}) => {
  const topScore = game.players.reduce(
    (max, current) => (current.totalScore > max ? current.totalScore : max),
    0
  );

  return game.players.filter((player) => player.totalScore === topScore).map((player) => player.name);
};

const isDraw = (game: {
  players: Array<Pick<PlayerWithScores, "totalScore" | "name">>;
}) => {
  return getWinnersNames(game).length > 1;
};

export default function ComparePlayers() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">{`${loaderData.playerOne.name} ${loaderData.playerOne.won} vs ${loaderData.playerTwo.won} ${loaderData.playerTwo.name} `}</h1>
      {loaderData.relevantGames.map((game) => (
        <div key={game?.id}>
          <span>{game?.createdAt.slice(0, 10)}&nbsp;</span>
          <span>
            {isDraw(game) ? "Drawn" : `${getWinnersNames(game)[0]} won`}
          </span>
        </div>
      ))}
      {loaderData.relevantGames.length === 0 && (
        <div>You haven't played any games</div>
      )}
    </>
  );
}
