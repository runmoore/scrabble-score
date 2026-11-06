import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getFavouriteColors } from "~/utils/school-league-table";
import type { SchoolRecordWithAverage } from "~/models/school-league-table.server";

type SchoolLeagueChartProps = {
  favouritedRows: SchoolRecordWithAverage[];
  yearKeys: string[];
};

function computeYDomain(
  favouritedRows: SchoolRecordWithAverage[],
  yearKeys: string[]
): [number, number] {
  const values = favouritedRows.flatMap((row) =>
    yearKeys
      .map((year) => row.scores[year])
      .filter((value): value is number => value !== null && value !== undefined)
  );

  if (values.length === 0) {
    return [0, 100];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(5, (max - min) * 0.1);

  return [Math.max(0, min - padding), Math.min(100, max + padding)];
}

export function SchoolLeagueChart({
  favouritedRows,
  yearKeys,
}: SchoolLeagueChartProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (favouritedRows.length === 0) {
    return (
      <div
        data-testid="chart-empty-state"
        className="flex h-64 items-center justify-center rounded border border-dashed border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400"
      >
        Star some schools to compare their scores here.
      </div>
    );
  }

  const colors = getFavouriteColors(favouritedRows.map((row) => row.id));
  const domain = computeYDomain(favouritedRows, yearKeys);

  const chartData = yearKeys.map((year) => {
    const point: Record<string, number | string | null> = { year };
    favouritedRows.forEach((row) => {
      point[String(row.id)] = row.scores[year] ?? null;
    });
    return point;
  });

  // Render the hovered line last so it's painted on top of the others.
  const orderedRows =
    hoveredId === null
      ? favouritedRows
      : [
          ...favouritedRows.filter((row) => row.id !== hoveredId),
          ...favouritedRows.filter((row) => row.id === hoveredId),
        ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={domain} />
          <Tooltip />
          {orderedRows.map((row) => {
            const isHovered = hoveredId === row.id;
            const isMuted = hoveredId !== null && !isHovered;
            return (
              <Line
                key={row.id}
                dataKey={String(row.id)}
                name={row.school_name}
                stroke={colors.get(row.id)}
                connectNulls={false}
                strokeWidth={isHovered ? 3 : 2}
                strokeOpacity={isMuted ? 0.25 : 1}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <ul
        data-testid="chart-legend"
        className="mt-4 flex flex-wrap gap-3 text-sm"
      >
        {favouritedRows.map((row) => (
          <li
            key={row.id}
            data-testid={`chart-legend-item-${row.id}`}
            className="flex cursor-default items-center gap-2"
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span
              className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: colors.get(row.id) }}
            />
            {row.school_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
