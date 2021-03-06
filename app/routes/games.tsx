import { Form, Link, useLoaderData } from "@remix-run/react";
import { useUser } from "~/utils";
import { Outlet } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import { getAllGames } from "~/models/game.server";
import { NavLink } from "@remix-run/react";
import type { Game, Player, Score } from "../models/game.server";
import { format } from "date-fns";
import { getNextPlayerToPlay } from "~/game-utils";

type LoaderData = {
  games: {
    id: Game["id"];
    players: Player[];
    scores: Score[];
    createdAt: Game["createdAt"];
    completed: Game["completed"];
  }[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const games = await getAllGames({ userId });

  return json<LoaderData>({ games });
};

export default function GamesPage() {
  const user = useUser();
  const { games }: LoaderData = useLoaderData();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Games</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Game
          </Link>

          <hr />

          {games.length === 0 ? (
            <p className="p-4">No games yet</p>
          ) : (
            <ol>
              {games.map((game) => (
                <li key={game.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={
                      game.completed
                        ? game.id
                        : `${game.id}/play/${getNextPlayerToPlay(game).id}`
                    }
                  >
                    {game.completed ? "????" : "????"}{" "}
                    {format(new Date(game.createdAt), "PPP HH:mm")}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
