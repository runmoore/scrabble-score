interface ScoreTablePlayer {
  id: string;
  name: string;
  scores: { id: string; points: number }[];
  totalScore: number;
}

export function ScoreTable({
  players,
  topScore,
}: {
  players: ScoreTablePlayer[];
  topScore: number;
}) {
  const maxNumberOfTurns = players.reduce(
    (max, { scores }) => Math.max(max, scores.length),
    0
  );

  return (
    <div className="flex flex-row gap-2 text-center md:gap-4">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex min-w-0 flex-1 flex-col ${
            player.totalScore === topScore && player.totalScore > 0
              ? "rounded-md bg-yellow-100/80 dark:bg-yellow-900/40"
              : ""
          }`}
        >
          <span
            className={`truncate font-bold dark:text-gray-100 ${
              players.length > 4 ? "text-xs md:text-base" : ""
            }`}
            title={player.name}
          >
            {player.name}
          </span>
          {player.scores.map((score) => (
            <span key={score.id} className="leading-6 dark:text-gray-200">
              {score.points}
            </span>
          ))}
          {new Array(maxNumberOfTurns - player.scores.length)
            .fill(null)
            .map((_, i) => (
              <span key={i} className="leading-6">
                &nbsp;
              </span>
            ))}
          <div className="border-t-4 border-b-4 px-1 font-bold dark:border-gray-600 dark:text-gray-100">
            {player.totalScore}
          </div>
        </div>
      ))}
    </div>
  );
}
