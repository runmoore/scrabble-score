import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { format } from "date-fns";
import invariant from "tiny-invariant";
import { Card } from "~/components/Card";
import type { GameType } from "~/models/game.server";
import { getPlayer, getPlayerGames } from "~/models/game.server";
import { enrichPlayerScores, assignPlaces } from "~/game-utils";
import { getNumberWithOrdinal } from "~/components/Leaderboard";
import { requireUserId } from "~/session.server";

interface GameTypeStats {
  gameTypeId: string | null;
  gameTypeName: string;
  gamesPlayed: number;
  wins: number;
  totalScore: number;
  highestScore: number;
  highestScoreGameId: string;
  highestScoreGameDate: string;
}

type EnrichedGame = Omit<
  Awaited<ReturnType<typeof getPlayerGames>>[number],
  "players"
> & {
  players: ReturnType<typeof assignPlaces>;
};

export function isOutrightWinner(
  player: { place?: number },
  allPlayers: { place?: number }[]
): boolean {
  if (player.place !== 1) return false;
  return allPlayers.filter((p) => p.place === 1).length === 1;
}

function collectAvailableGameTypes(
  allGames: Awaited<ReturnType<typeof getPlayerGames>>
) {
  return Object.values(
    allGames.reduce<Record<string, Pick<GameType, "id" | "name">>>(
      (acc, game) => {
        if (game.gameType) acc[game.gameType.id] = game.gameType;
        return acc;
      },
      {}
    )
  ).sort((a, b) => a.name.localeCompare(b.name));
}

interface TypeAccumulator {
  name: string;
  wins: number;
  totalScore: number;
  highestScore: number;
  highestScoreGameId: string;
  highestScoreGameDate: string;
  count: number;
}

function computeAggregateStats(
  completedGames: EnrichedGame[],
  playerId: string,
  selectedTypeId: string | null
) {
  const gamesPlayed = completedGames.length;
  let wins = 0;
  let totalScore = 0;
  let highestScore = -Infinity;
  let highestScoreGameId = "";
  let highestScoreGameDate = "";
  const typeAccumulators = new Map<string, TypeAccumulator>();

  for (const game of completedGames) {
    const thisPlayer = game.players.find((p) => p.id === playerId);
    if (!thisPlayer) continue;

    const isWin = isOutrightWinner(thisPlayer, game.players);
    if (isWin) wins++;

    totalScore += thisPlayer.totalScore;
    if (thisPlayer.totalScore > highestScore) {
      highestScore = thisPlayer.totalScore;
      highestScoreGameId = game.id;
      highestScoreGameDate = new Date(game.createdAt).toISOString();
    }

    const typeId = game.gameType?.id;
    if (typeId && !selectedTypeId) {
      const acc = typeAccumulators.get(typeId) ?? {
        name: game.gameType!.name,
        wins: 0,
        totalScore: 0,
        highestScore: -Infinity,
        highestScoreGameId: "",
        highestScoreGameDate: "",
        count: 0,
      };
      acc.count++;
      acc.totalScore += thisPlayer.totalScore;
      if (isWin) acc.wins++;
      if (thisPlayer.totalScore > acc.highestScore) {
        acc.highestScore = thisPlayer.totalScore;
        acc.highestScoreGameId = game.id;
        acc.highestScoreGameDate = new Date(game.createdAt).toISOString();
      }
      typeAccumulators.set(typeId, acc);
    }
  }

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const averageScore =
    selectedTypeId && gamesPlayed > 0
      ? Math.round(totalScore / gamesPlayed)
      : 0;

  const perTypeStats: GameTypeStats[] = [...typeAccumulators.entries()]
    .map(([typeId, acc]) => ({
      gameTypeId: typeId,
      gameTypeName: acc.name,
      gamesPlayed: acc.count,
      wins: acc.wins,
      totalScore: acc.totalScore,
      highestScore: acc.highestScore,
      highestScoreGameId: acc.highestScoreGameId,
      highestScoreGameDate: acc.highestScoreGameDate,
    }))
    .sort((a, b) => a.gameTypeName.localeCompare(b.gameTypeName));

  return {
    gamesPlayed,
    wins,
    winRate,
    averageScore,
    highestScore,
    highestScoreGameId,
    highestScoreGameDate,
    perTypeStats,
  };
}

function buildGameHistory(enrichedGames: EnrichedGame[], playerId: string) {
  return enrichedGames.map((game) => {
    const thisPlayer = game.players.find((p) => p.id === playerId);
    return {
      id: game.id,
      createdAt: game.createdAt,
      completed: game.completed,
      gameTypeName: game.gameType?.name ?? null,
      score: thisPlayer?.totalScore ?? 0,
      place: game.completed ? thisPlayer?.place ?? null : null,
      playerCount: game.players.length,
    };
  });
}

function computeStats(
  allGames: Awaited<ReturnType<typeof getPlayerGames>>,
  playerId: string,
  selectedTypeId: string | null
) {
  const enrichedGames = allGames.map((game) => ({
    ...game,
    players: assignPlaces(enrichPlayerScores(game.players, game.scores)),
  }));

  const completedGames = enrichedGames.filter((g) => g.completed);

  const filteredCompleted = selectedTypeId
    ? completedGames.filter((g) => g.gameType?.id === selectedTypeId)
    : completedGames;

  const filteredAll = selectedTypeId
    ? enrichedGames.filter((g) => g.gameType?.id === selectedTypeId)
    : enrichedGames;

  const availableGameTypes = collectAvailableGameTypes(allGames);
  const aggregateStats = computeAggregateStats(
    filteredCompleted,
    playerId,
    selectedTypeId
  );
  const history = buildGameHistory(filteredAll, playerId);

  return {
    ...aggregateStats,
    history,
    availableGameTypes,
  };
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.playerId, "playerId not found");
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const selectedTypeId = url.searchParams.get("type");

  const [player, allGames] = await Promise.all([
    getPlayer({ id: params.playerId, userId }),
    getPlayerGames({ playerId: params.playerId, userId }),
  ]);

  if (!player) throw new Response("Not Found", { status: 404 });

  const stats = computeStats(allGames, params.playerId, selectedTypeId);

  return json({
    player,
    ...stats,
  });
};

export default function PlayerDetail() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTypeId = searchParams.get("type");

  const handlePillClick = (typeId: string) => {
    setSearchParams((params) => {
      if (params.get("type") === typeId) {
        params.delete("type");
      } else {
        params.set("type", typeId);
      }
      return params;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-gray-100">
        {data.player.name}
      </h1>

      {/* Game Type Filter Pills */}
      {data.availableGameTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {data.availableGameTypes.map((gt) => (
            <button
              key={gt.id}
              onClick={() => handlePillClick(gt.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTypeId === gt.id
                  ? "bg-blue-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {gt.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {data.gamesPlayed === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No completed games yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card title="Games Played">
            <p className="text-3xl font-bold text-blue-primary dark:text-blue-400">
              {data.gamesPlayed}
            </p>
          </Card>

          <Card title="Win Rate">
            <p className="text-3xl font-bold text-green-primary dark:text-green-400">
              {data.winRate}%
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {data.wins} {data.wins === 1 ? "win" : "wins"} of{" "}
              {data.gamesPlayed}
            </p>
          </Card>

          {/* Average Score */}
          {selectedTypeId ? (
            <Card title="Average Score">
              <p className="text-3xl font-bold text-purple-primary dark:text-purple-400">
                {data.averageScore}
              </p>
            </Card>
          ) : (
            <Card title="Average Score">
              <div className="space-y-2">
                {data.perTypeStats.map((ts) => (
                  <div
                    key={ts.gameTypeId}
                    className="flex justify-between text-sm dark:text-gray-300"
                  >
                    <span>{ts.gameTypeName}</span>
                    <span className="font-medium text-purple-primary dark:text-purple-400">
                      {ts.gamesPlayed > 0
                        ? Math.round(ts.totalScore / ts.gamesPlayed)
                        : 0}
                    </span>
                  </div>
                ))}
                {data.perTypeStats.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No game types assigned
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Highest Score */}
          {selectedTypeId ? (
            data.highestScoreGameId && (
              <Card
                title="Highest Score"
                asLink
                to={`/games/${data.highestScoreGameId}`}
              >
                <p className="text-3xl font-bold text-purple-primary dark:text-purple-400">
                  {data.highestScore}
                </p>
                {data.highestScoreGameDate && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {format(data.highestScoreGameDate, "do MMM yyyy")}
                  </p>
                )}
              </Card>
            )
          ) : (
            <Card title="Highest Score">
              <div className="space-y-2">
                {data.perTypeStats.map(
                  (ts) =>
                    ts.highestScoreGameId && (
                      <Link
                        key={ts.gameTypeId}
                        to={`/games/${ts.highestScoreGameId}`}
                        className="flex justify-between text-sm hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <span>{ts.gameTypeName}</span>
                        <span className="font-medium text-purple-primary dark:text-purple-400">
                          {ts.highestScore}
                        </span>
                      </Link>
                    )
                )}
                {data.perTypeStats.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No game types assigned
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Game History */}
      <div>
        <h2 className="mb-4 text-xl font-semibold dark:text-gray-100">
          All Games
        </h2>
        {data.history.length === 0 ? (
          <p className="py-8 text-center text-gray-600 dark:text-gray-400">
            No games found
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {data.history.map((game, index) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className={`flex items-center p-4 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="w-[28%] text-sm text-gray-600 dark:text-gray-400">
                  {format(game.createdAt, "do MMM yyyy")}
                </div>
                <div className="w-[22%] truncate text-center text-sm text-gray-600 dark:text-gray-400">
                  {game.gameTypeName ?? "—"}
                </div>
                <div className="w-[20%] text-center font-medium text-blue-primary dark:text-blue-400">
                  {game.score}
                </div>
                <div className="w-[30%] text-center text-sm">
                  {game.completed ? (
                    <span className="text-gray-700 dark:text-gray-300">
                      {game.place != null
                        ? `${getNumberWithOrdinal(game.place)} of ${
                            game.playerCount
                          }`
                        : "—"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      In Progress
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
