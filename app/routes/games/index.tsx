import { NavLink, Link, useRouteLoaderData } from "@remix-run/react";
import { getNextPlayerToPlay } from "~/game-utils";
import { formatDistanceToNow } from "date-fns";
import type { loader } from "~/routes/games";

export default function Games() {
  const { games } = useRouteLoaderData<typeof loader>("routes/games")!;

  return (
    <div>
      {games.filter((g) => !g.completed).length > 0 && (
        <>
          <h2 className="text-xl dark:text-gray-100">In progress games</h2>
          <ol className="list-inside list-disc">
            {games
              .filter((g) => !g.completed)
              .map((game) => (
                <li key={game.id} className="pb-2 pt-2 dark:text-gray-200">
                  <NavLink
                    to={`${game.id}/play/${getNextPlayerToPlay(game).id}`}
                    className="dark:text-blue-400"
                  >
                    {formatDistanceToNow(new Date(game.createdAt), {
                      addSuffix: true,
                    })}
                  </NavLink>
                </li>
              ))}
          </ol>
        </>
      )}

      <Link
        to="new"
        className="my-4 block rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        New Game
      </Link>
    </div>
  );
}
