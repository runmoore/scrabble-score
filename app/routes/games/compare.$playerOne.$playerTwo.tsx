import { Link, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Card } from "~/components/Card";
import type { PlayerWithScores } from "~/models/game.server";
import { getAllGames, getGame, getPlayer } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import { formatDate } from "~/utils/date";

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

  let highestScore: {
    score: number;
    playerName: string;
    gameId: string;
    gameDate: Date | string;
  } = {
    score: 0,
    playerName: "",
    gameId: "",
    gameDate: "",
  };

  for (const [index, game] of relevantGames.entries()) {
    if (!game) continue;

    const p1 = game.players.find((player) => player.id === params.playerOne);
    const p2 = game.players.find((player) => player.id === params.playerTwo);

    if (!p1 || !p2) continue;

    // Track wins
    if (p1.totalScore > p2.totalScore) {
      playerOne.won++;
      if (index < 5) playerOne.wonLastFive++;
    } else if (p1.totalScore < p2.totalScore) {
      playerTwo.won++;
      if (index < 5) playerTwo.wonLastFive++;
    }

    // Track highest score
    if (p1.totalScore > highestScore.score) {
      highestScore = {
        score: p1.totalScore,
        playerName: p1.name,
        gameId: game.id,
        gameDate: game.createdAt,
      };
    }
    if (p2.totalScore > highestScore.score) {
      highestScore = {
        score: p2.totalScore,
        playerName: p2.name,
        gameId: game.id,
        gameDate: game.createdAt,
      };
    }
  }

  return json({ playerOne, playerTwo, relevantGames, highestScore });
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
        <Card title="All-Time Record">
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
        </Card>

        {/* Last 5 Games Card - Only show if more than 5 games played */}
        {loaderData.relevantGames.length > 5 && (
          <Card title="Last 5 Games">
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
          </Card>
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
              <Card
                title="Last Game Played"
                asLink
                to={`/games/${lastGame.id}`}
              >
                <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(lastGame.createdAt)}
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
              </Card>
            );
          })()}

        {/* Highest Score Card */}
        {loaderData.highestScore.score > 0 && (
          <Card
            title="Highest Game Score"
            asLink
            to={`/games/${loaderData.highestScore.gameId}`}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-primary dark:text-purple-400">
                {loaderData.highestScore.score}
              </div>
              <div className="mt-2 text-lg font-medium dark:text-gray-100">
                {loaderData.highestScore.playerName}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(loaderData.highestScore.gameDate)}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* All Games List */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold dark:text-gray-100">
          All Games
        </h2>
        {loaderData.relevantGames.length === 0 ? (
          <div className="py-8 text-center text-gray-600 dark:text-gray-400">
            You haven't played any games yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {loaderData.relevantGames.map((game, index) => {
              const p1 = game.players.find(
                (player) => player.name === loaderData.playerOne.name
              );
              const p2 = game.players.find(
                (player) => player.name === loaderData.playerTwo.name
              );
              const winner = isDraw(game) ? "Draw" : getWinnersNames(game)[0];
              const score = `${p1?.totalScore ?? 0} - ${p2?.totalScore ?? 0}`;

              return (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(game.createdAt)}
                    </div>
                  </div>
                  <div className="flex-1 text-center font-medium dark:text-gray-100">
                    {winner}
                  </div>
                  <div className="flex-1 text-center text-gray-600 dark:text-gray-400">
                    {score}
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-sm text-blue-primary hover:underline dark:text-blue-400">
                      View
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
