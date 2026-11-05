import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

import { SchoolLeagueChart } from "~/components/SchoolLeagueChart";
import { getSchoolLeagueTableData } from "~/models/school-league-table.server";
import type { SchoolRecordWithAverage } from "~/models/school-league-table.server";
import {
  filterRows,
  parseTableState,
  serializeTableState,
  sortRows,
} from "~/utils/school-league-table";
import type { TableState } from "~/utils/school-league-table";

const BENCHMARK_NAMES = new Set([
  "Scotland all funded",
  "All publicly funded schools",
]);

export const loader = async () => {
  return json({ rows: getSchoolLeagueTableData() });
};

type Column = { key: string; label: string };

function formatCell(row: SchoolRecordWithAverage, key: string): string {
  const value = key === "fiveYearAvg" ? row.fiveYearAvg : row.scores[key];
  return value === null || value === undefined ? "—" : String(value);
}

export default function SchoolLeagueTable() {
  const { rows } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const state = parseTableState(searchParams);

  const yearKeys = rows.length > 0 ? Object.keys(rows[0].scores) : [];
  const columns: Column[] = [
    { key: "school_name", label: "School Name" },
    ...yearKeys.map((year) => ({ key: year, label: year })),
    { key: "fiveYearAvg", label: "5yr Avg" },
  ];

  const filteredRows = filterRows(rows, state);
  const displayedRows = sortRows(filteredRows, state);

  const favouritedRows = rows
    .filter((row) => state.favouriteIds.has(row.id))
    .sort((a, b) => a.id - b.id);

  function updateState(patch: Partial<TableState>) {
    const next: TableState = { ...state, ...patch };
    setSearchParams(serializeTableState(next), { replace: true });
  }

  function handleSort(key: string) {
    if (state.sortKey === key) {
      updateState({ sortDir: state.sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateState({
        sortKey: key,
        sortDir: key === "school_name" ? "asc" : "desc",
      });
    }
  }

  function toggleFavourite(id: number) {
    const next = new Set(state.favouriteIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updateState({ favouriteIds: next });
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          School League Table
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          City of Edinburgh primary school attainment, 2020/21–2024/25.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.rcOnly}
            onChange={() => updateState({ rcOnly: !state.rcOnly })}
          />
          Roman Catholic schools only
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.favOnly}
            onChange={() => updateState({ favOnly: !state.favOnly })}
          />
          Favourites only
        </label>

        <input
          type="text"
          aria-label="Search school name"
          placeholder="Search school name…"
          value={state.search}
          onChange={(e) => updateState({ search: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredRows.length} of {rows.length} rows
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">Favourite</th>
              {columns.map((column) => {
                const isActive = state.sortKey === column.key;
                return (
                  <th key={column.key} className="p-2 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="font-semibold hover:underline"
                    >
                      {column.label}
                      {isActive && (state.sortDir === "asc" ? " ▲" : " ▼")}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => {
              const isBenchmark = BENCHMARK_NAMES.has(row.school_name);
              const isFavourite = state.favouriteIds.has(row.id);

              return (
                <tr
                  key={row.id}
                  className={
                    isBenchmark
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "odd:bg-gray-50 dark:odd:bg-gray-800/50"
                  }
                >
                  <td className="p-2">
                    <button
                      type="button"
                      data-testid={`favourite-${row.id}`}
                      aria-label={
                        isFavourite
                          ? `Unfavourite ${row.school_name}`
                          : `Favourite ${row.school_name}`
                      }
                      onClick={() => toggleFavourite(row.id)}
                      className={
                        isFavourite
                          ? "text-yellow-500"
                          : "text-gray-400 dark:text-gray-500"
                      }
                    >
                      {isFavourite ? "★" : "☆"}
                    </button>
                  </td>
                  <td className="p-2">
                    {row.school_name}
                    {row.isRomanCatholic && (
                      <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        RC
                      </span>
                    )}
                  </td>
                  {yearKeys.map((year) => (
                    <td key={year} className="p-2">
                      {formatCell(row, year)}
                    </td>
                  ))}
                  <td className="p-2">{formatCell(row, "fiveYearAvg")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Compare favourites
        </h2>
        <SchoolLeagueChart favouritedRows={favouritedRows} yearKeys={yearKeys} />
      </section>
    </div>
  );
}
