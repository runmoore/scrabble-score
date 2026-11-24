import { index, route, type RouteConfig } from "@react-router/dev/routes";

// Every route is listed here. Files live in `app/routes/` and are not picked
// up automatically, so a new route file needs a line below (a test checks that).
export default [
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  route("join", "routes/join.tsx"),
  route("logout", "routes/logout.tsx"),
  route("healthcheck", "routes/healthcheck.tsx"),
  route("anagram", "routes/anagram.tsx"),
  route("cryptogram", "routes/cryptogram.tsx"),
  route("school-league-table", "routes/school-league-table.tsx"),
  route("games", "routes/games.tsx", [
    index("routes/games/index.tsx"),
    route("new", "routes/games/new.tsx"),
    route("players", "routes/games/players.tsx"),
    route("players/:playerId", "routes/games/players.$playerId.tsx"),
    route("compare", "routes/games/compare.tsx"),
    route(
      "compare/:playerOne/:playerTwo",
      "routes/games/compare.$playerOne.$playerTwo.tsx"
    ),
    route(":gameId", "routes/games/$gameId.tsx"),
    route(":gameId/play/:playerId", "routes/games/$gameId.play.$playerId.tsx"),
  ]),
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
