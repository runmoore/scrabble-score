import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { formatDistanceToNow, format } from "date-fns";
import { getNextPlayerToPlay } from "~/game-utils";
import {
  getLastCompletedGame,
  getTopGameTypes,
  getTopPlayers,
} from "~/models/game.server";
import { requireUserId } from "~/session.server";
import { Card } from "~/components/Card";
import { Leaderboard } from "~/components/Leaderboard";
import type { loader as gamesLoader } from "~/routes/games";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const [lastCompletedGame, topGameTypes, topPlayers] = await Promise.all([
    getLastCompletedGame({ userId }),
    getTopGameTypes({ userId, limit: 3 }),
    getTopPlayers({ userId, limit: 3 }),
  ]);
  return json({ lastCompletedGame, topGameTypes, topPlayers });
};

export default function Games() {
  const { games } = useRouteLoaderData<typeof gamesLoader>("routes/games")!;
  const { lastCompletedGame, topGameTypes, topPlayers } =
    useLoaderData<typeof loader>();

  const inProgressGames = games.filter((g) => !g.completed);
  const completedGameCount = games.filter((g) => g.completed).length;

  return (
    <div>
      <Link
        to="new"
        className="mb-6 hidden rounded bg-blue-500 py-2 px-4 text-center text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 sm:block"
      >
        New Game
      </Link>

      <div className="mb-6 grid grid-cols-1 gap-4 pb-20 sm:pb-0 md:grid-cols-2 lg:grid-cols-3">
        {inProgressGames.map((game) => {
          const nextPlayer = getNextPlayerToPlay(game);
          const playerTotals = game.players.map((player) => ({
            name: player.name,
            total: game.scores
              .filter((s) => s.playerId === player.id)
              .reduce((sum, s) => sum + s.points, 0),
          }));

          const title = game.gameType
            ? `${game.gameType.name} · ${formatDistanceToNow(
                new Date(game.createdAt),
                { addSuffix: true }
              )}`
            : formatDistanceToNow(new Date(game.createdAt), {
                addSuffix: true,
              });

          return (
            <Card
              key={game.id}
              title={title}
              asLink
              to={`/games/${game.id}/play/${nextPlayer.id}`}
              accent
            >
              <div className="space-y-1">
                {playerTotals.map((pt) => (
                  <div
                    key={pt.name}
                    className="flex justify-between text-sm dark:text-gray-300"
                  >
                    <span>{pt.name}</span>
                    <span className="font-medium">{pt.total}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}

        <Card title="Completed Games">
          <p className="text-3xl font-bold text-blue-primary dark:text-blue-400">
            {completedGameCount}
          </p>
        </Card>

        <Card title="Most Popular Games">
          {topGameTypes.length > 0 ? (
            <ol className="space-y-1">
              {topGameTypes.map((gt, i, arr) => {
                const rank =
                  i === 0 || arr[i - 1].count !== gt.count
                    ? i + 1
                    : arr.findIndex((x) => x.count === gt.count) + 1;
                return (
                  <li
                    key={gt.gameTypeId}
                    className="flex justify-between text-sm dark:text-gray-300"
                  >
                    <span>
                      {rank}. {gt.name}
                    </span>
                    <span className="font-medium">
                      {gt.count} {gt.count === 1 ? "game" : "games"}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No game types used yet
            </p>
          )}
        </Card>

        <Card title="Most Active Players">
          {topPlayers.length > 0 ? (
            <ol className="space-y-1">
              {topPlayers.map((p, i, arr) => {
                const rank =
                  i === 0 || arr[i - 1].count !== p.count
                    ? i + 1
                    : arr.findIndex((x) => x.count === p.count) + 1;
                return (
                  <li
                    key={p.playerId}
                    className="flex justify-between text-sm dark:text-gray-300"
                  >
                    <span>
                      {rank}. {p.name}
                    </span>
                    <span className="font-medium">
                      {p.count} {p.count === 1 ? "game" : "games"}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No games played yet
            </p>
          )}
        </Card>

        {lastCompletedGame && (
          <Card
            title={
              lastCompletedGame.gameType
                ? `Last Game · ${lastCompletedGame.gameType.name}`
                : "Last Game"
            }
            asLink
            to={`/games/${lastCompletedGame.id}`}
          >
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(lastCompletedGame.createdAt), "do MMM yyyy")}
            </p>
            <Leaderboard players={lastCompletedGame.players} />
          </Card>
        )}
      </div>

      <Link
        to="new"
        className="fixed bottom-6 right-4 z-10 rounded-full bg-blue-500 px-5 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 sm:hidden"
      >
        + New Game
      </Link>
    </div>
  );
}
