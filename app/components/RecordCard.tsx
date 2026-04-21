import { Card } from "~/components/Card";

const colorClasses = {
  blue: "text-blue-primary dark:text-blue-400",
  green: "text-green-primary dark:text-green-400",
} as const;

interface RecordCardProps {
  title: string;
  p1Label: string | undefined;
  p1Count: number;
  p2Label: string | undefined;
  p2Count: number;
  draws: number;
  color: keyof typeof colorClasses;
}

export function RecordCard({
  title,
  p1Label,
  p1Count,
  p2Label,
  p2Count,
  draws,
  color,
}: RecordCardProps) {
  return (
    <Card title={title}>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {p1Label}
          </div>
          <div className={`text-3xl font-bold ${colorClasses[color]}`}>
            {p1Count}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-400">-</div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {p2Label}
          </div>
          <div className={`text-3xl font-bold ${colorClasses[color]}`}>
            {p2Count}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-400">-</div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Draws
          </div>
          <div className="text-3xl font-bold text-gray-500 dark:text-gray-400">
            {draws}
          </div>
        </div>
      </div>
    </Card>
  );
}
