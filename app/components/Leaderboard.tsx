export interface LeaderboardPlayer {
  id: string;
  name: string;
  totalScore: number;
  place: number;
}

interface LeaderboardProps {
  players: LeaderboardPlayer[];
}

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes: Record<Intl.LDMLPluralRule, string> = {
  zero: "",
  one: "st",
  two: "nd",
  few: "rd",
  many: "",
  other: "th",
};

export function getNumberWithOrdinal(n: number) {
  const category = english_ordinal_rules.select(n);
  const suffix = suffixes[category];
  return n + suffix;
}

export function Leaderboard({ players }: LeaderboardProps) {
  return (
    <div className="flex justify-around dark:text-gray-200">
      <div>
        {players.map((p) => (
          <p key={p.id}>
            {getNumberWithOrdinal(p.place)} {p.place === 1 && "🏆"}
          </p>
        ))}
      </div>
      <div>
        {players.map((p) => (
          <p key={p.id}>{p.name}</p>
        ))}
      </div>
      <div>
        {players.map((p) => (
          <p key={p.id}>{p.totalScore}</p>
        ))}
      </div>
    </div>
  );
}
