import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getTopPlayers } from "~/models/game.server";
import { requireUserId } from "~/session.server";
import { Card } from "~/components/Card";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const players = await getTopPlayers({ userId, limit: Infinity });
  return json({ players });
};

export default function PlayersIndex() {
  const { players } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold dark:text-gray-100">Players</h1>

      {players.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No players yet.{" "}
          <Link
            to="/games/new"
            className="text-blue-500 underline dark:text-blue-400"
          >
            Create a game
          </Link>{" "}
          to add players.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card
              key={player.playerId}
              title={player.name}
              asLink
              to={`/games/players/${player.playerId}`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {player.count} {player.count === 1 ? "game" : "games"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
