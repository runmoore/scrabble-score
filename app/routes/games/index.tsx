import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { formatDistanceToNow, format } from "date-fns";
import { getNextPlayerToPlay } from "~/game-utils";
import { getLastCompletedGame } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import { Card } from "~/components/Card";
import { Leaderboard } from "~/components/Leaderboard";
import type { loader as gamesLoader } from "~/routes/games";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const lastCompletedGame = await getLastCompletedGame({ userId });
  return json({ lastCompletedGame });
};

export default function Games() {
  const { games } = useRouteLoaderData<typeof gamesLoader>("routes/games")!;
  const { lastCompletedGame } = useLoaderData<typeof loader>();

  const inProgressGames = games.filter((g) => !g.completed);
  const completedGameCount = games.filter((g) => g.completed).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        className="block rounded bg-blue-500 py-2 px-4 text-center text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        New Game
      </Link>
    </div>
  );
}
