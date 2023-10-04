import { Form, Link, useLoaderData, Outlet, NavLink } from "@remix-run/react";
import { useUser } from "~/utils";
import { json } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import type { Game } from "~/models/game.server";
import { getAllGames } from "~/models/game.server";
import { format } from "date-fns";
import { getNextPlayerToPlay } from "~/game-utils";
import { useState } from "react";
import type { LoaderArgs } from "@remix-run/node";

import MenuIcon from "../icons/menu";
export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const games = await getAllGames({ userId });

  return json({ games });
}

export default function GamesPage() {
  const user = useUser();
  const { games } = useLoaderData<typeof loader>();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Games</Link>
        </h1>
        <p>{user.email}</p>
        <button
          type="button"
          className={`rounded  py-2 px-4 text-blue-100 sm:hidden ${
            showMobileMenu ? "bg-slate-500" : "bg-slate-600"
          }`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <MenuIcon
            className={`duration-500 ${showMobileMenu ? "-rotate-90" : ""}`}
          />
        </button>
        <Form action="/logout" method="post" className="hidden sm:block">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-gray-100 hover:bg-blue-primary active:bg-blue-secondary"
          >
            Logout
          </button>
        </Form>
      </header>
      <main className="h-full flex-col bg-white sm:flex sm:flex-row">
        {showMobileMenu && (
          <GamesMenu
            games={games}
            className="bg-gray-50 sm:hidden"
            onLinkClick={() => setShowMobileMenu(false)}
          />
        )}
        <GamesMenu
          className="hidden h-full w-80 border-r bg-gray-50 sm:block"
          games={games}
        />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function GamesMenu({
  games,
  className,
  onLinkClick = () => {},
}: {
  games: {
    id: Game["id"];
    players: any[];
    createdAt: string;
    completed: Game["completed"];
    scores: any[];
  }[];
  className?: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className={className}>
      <NavLink
        to="compare"
        className="block border-b p-4 text-xl text-blue-500"
        onClick={() => onLinkClick()}
      >
        Compare Players
      </NavLink>
      <Link
        to="new"
        className="block p-4 text-xl text-blue-500"
        onClick={() => onLinkClick()}
      >
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
                onClick={() => onLinkClick()}
                to={
                  game.completed
                    ? game.id
                    : `${game.id}/play/${getNextPlayerToPlay(game).id}`
                }
              >
                {game.completed ? "🏆" : "🎯"}{" "}
                {format(new Date(game.createdAt), "PPP HH:mm")}
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
