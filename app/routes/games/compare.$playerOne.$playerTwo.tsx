import { Link, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { PlayerWithScores } from "~/models/game.server";
import { getAllGames, getGame, getPlayer } from "~/models/game.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.playerOne, "playerOne not found");
  invariant(params.playerTwo, "playerTwo not found");

  const userId = await requireUserId(request);

  const [playerOneName, playerTwoName, allGames] = await Promise.all([
    (await getPlayer({ id: params.playerOne, userId }))?.name,
    (await getPlayer({ id: params.playerTwo, userId }))?.name,
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
    wonLastFive: 0,
    name: playerOneName,
  };

  const playerTwo = {
    won: 0,
    wonLastFive: 0,
    name: playerTwoName,
  };

  for (const [index, game] of relevantGames.entries()) {
    if (!game) continue;

    const p1 = game.players.find((player) => player.id === params.playerOne);
    const p2 = game.players.find((player) => player.id === params.playerTwo);

    if (!p1 || !p2) continue;

    if (p1.totalScore > p2.totalScore) {
      playerOne.won++;
      if (index < 5) playerOne.wonLastFive++;
    } else if (p1.totalScore < p2.totalScore) {
      playerTwo.won++;
      if (index < 5) playerTwo.wonLastFive++;
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

  return game.players
    .filter((player) => player.totalScore === topScore)
    .map((player) => player.name);
};

const isDraw = (game: {
  players: Array<Pick<PlayerWithScores, "totalScore" | "name">>;
}) => {
  return getWinnersNames(game).length > 1;
};

export default function ComparePlayers() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold dark:text-gray-100">
        {loaderData.playerOne.name} vs {loaderData.playerTwo.name}
      </h1>

      {/* Card Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* All-Time Record Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold dark:text-gray-100">
            All-Time Record
          </h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {loaderData.playerOne.name}
              </div>
              <div className="text-3xl font-bold text-blue-primary dark:text-blue-400">
                {loaderData.playerOne.won}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-400">-</div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {loaderData.playerTwo.name}
              </div>
              <div className="text-3xl font-bold text-blue-primary dark:text-blue-400">
                {loaderData.playerTwo.won}
              </div>
            </div>
          </div>
        </div>

        {/* Last 5 Games Card - Only show if more than 5 games played */}
        {loaderData.relevantGames.length > 5 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold dark:text-gray-100">
              Last 5 Games
            </h2>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {loaderData.playerOne.name}
                </div>
                <div className="text-3xl font-bold text-green-primary dark:text-green-400">
                  {loaderData.playerOne.wonLastFive}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {loaderData.playerTwo.name}
                </div>
                <div className="text-3xl font-bold text-green-primary dark:text-green-400">
                  {loaderData.playerTwo.wonLastFive}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Game Card */}
        {loaderData.relevantGames.length > 0 &&
          (() => {
            const lastGame = loaderData.relevantGames[0];
            const p1 = lastGame.players.find(
              (player) => player.name === loaderData.playerOne.name
            );
            const p2 = lastGame.players.find(
              (player) => player.name === loaderData.playerTwo.name
            );
            const p1Won = p1 && p2 && p1.totalScore > p2.totalScore;
            const p2Won = p1 && p2 && p2.totalScore > p1.totalScore;

            return (
              <Link
                to={`/games/${lastGame.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <h2 className="mb-4 text-lg font-semibold dark:text-gray-100">
                  Last Game Played
                </h2>
                <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(lastGame.createdAt).toLocaleDateString()}
                </div>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between rounded p-2 ${
                      p1Won ? "bg-yellow-100 dark:bg-yellow-900" : ""
                    }`}
                  >
                    <div className="font-medium dark:text-gray-100">
                      {loaderData.playerOne.name}
                    </div>
                    <div className="text-2xl font-bold text-blue-primary dark:text-blue-400">
                      {p1?.totalScore ?? 0}
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-between rounded p-2 ${
                      p2Won ? "bg-yellow-100 dark:bg-yellow-900" : ""
                    }`}
                  >
                    <div className="font-medium dark:text-gray-100">
                      {loaderData.playerTwo.name}
                    </div>
                    <div className="text-2xl font-bold text-blue-primary dark:text-blue-400">
                      {p2?.totalScore ?? 0}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })()}
      </div>

      {/* Temporary: Keep existing games list */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold dark:text-gray-100">
          All Games
        </h2>
        {loaderData.relevantGames.map((game) => (
          <div key={game?.id} className="dark:text-gray-200">
            <span>{game?.createdAt.slice(0, 10)}&nbsp;</span>
            <span>
              {isDraw(game) ? "Drawn" : `${getWinnersNames(game)[0]} won`}
            </span>
          </div>
        ))}
        {loaderData.relevantGames.length === 0 && (
          <div className="dark:text-gray-200">You haven't played any games</div>
        )}
      </div>
    </div>
  );
}
