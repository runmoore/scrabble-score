import type { SchoolRecordWithAverage } from "~/models/school-league-table.server";

export type SortDirection = "asc" | "desc";

export type TableState = {
  sortKey: string;
  sortDir: SortDirection;
  rcOnly: boolean;
  favOnly: boolean;
  search: string;
  favouriteIds: Set<number>;
};

export const DEFAULT_TABLE_STATE: TableState = {
  sortKey: "school_name",
  sortDir: "asc",
  rcOnly: false,
  favOnly: false,
  search: "",
  favouriteIds: new Set<number>(),
};

// Brand `-primary` colors (tailwind.config.js) first, then extended
// Tailwind-default primaries, so a chart with more than 5 favourites still
// gets distinct colors before any repeat.
export const CHART_COLORS = [
  "#0fa1a9", // green-primary
  "#054184", // blue-primary
  "#d1435b", // red-primary
  "#ffb54d", // yellow-primary
  "#5a489b", // purple-primary
  "#059669", // emerald-600
  "#4f46e5", // indigo-600
  "#e11d48", // rose-600
  "#d97706", // amber-600
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
];

/**
 * Assigns a stable color per favourited row, keyed by the row's `id` in
 * ascending order (the dataset's fixed order) rather than the table's
 * current sort/filter order, so a school's line color doesn't shift when
 * the table is re-sorted.
 */
export function getFavouriteColors(
  favouriteIds: Iterable<number>
): Map<number, string> {
  const orderedIds = Array.from(favouriteIds).sort((a, b) => a - b);
  const colors = new Map<number, string>();

  orderedIds.forEach((id, index) => {
    colors.set(id, CHART_COLORS[index % CHART_COLORS.length]);
  });

  return colors;
}

function getSortValue(
  row: SchoolRecordWithAverage,
  sortKey: string
): string | number | null {
  if (sortKey === "school_name") return row.school_name;
  if (sortKey === "fiveYearAvg") return row.fiveYearAvg;
  return row.scores[sortKey] ?? null;
}

export function parseTableState(searchParams: URLSearchParams): TableState {
  return {
    sortKey: searchParams.get("sort") ?? DEFAULT_TABLE_STATE.sortKey,
    sortDir:
      searchParams.get("dir") === "desc"
        ? "desc"
        : searchParams.get("dir") === "asc"
          ? "asc"
          : DEFAULT_TABLE_STATE.sortDir,
    rcOnly: searchParams.get("rc") === "1",
    favOnly: searchParams.get("favOnly") === "1",
    search: searchParams.get("q") ?? DEFAULT_TABLE_STATE.search,
    favouriteIds: new Set(searchParams.getAll("favs").map((id) => Number(id))),
  };
}

export function serializeTableState(state: TableState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.sortKey !== DEFAULT_TABLE_STATE.sortKey) {
    params.set("sort", state.sortKey);
  }
  if (state.sortDir !== DEFAULT_TABLE_STATE.sortDir) {
    params.set("dir", state.sortDir);
  }
  if (state.rcOnly) {
    params.set("rc", "1");
  }
  if (state.favOnly) {
    params.set("favOnly", "1");
  }
  if (state.search) {
    params.set("q", state.search);
  }
  for (const id of state.favouriteIds) {
    params.append("favs", String(id));
  }

  return params;
}

export function filterRows(
  rows: SchoolRecordWithAverage[],
  state: Pick<TableState, "rcOnly" | "favOnly" | "search" | "favouriteIds">
): SchoolRecordWithAverage[] {
  const search = state.search.trim().toLowerCase();

  return rows.filter((row) => {
    if (state.rcOnly && !row.isRomanCatholic) return false;
    if (state.favOnly && !state.favouriteIds.has(row.id)) return false;
    if (search && !row.school_name.toLowerCase().includes(search))
      return false;
    return true;
  });
}

export function sortRows(
  rows: SchoolRecordWithAverage[],
  state: Pick<TableState, "sortKey" | "sortDir">
): SchoolRecordWithAverage[] {
  const direction = state.sortDir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const aValue = getSortValue(a, state.sortKey);
    const bValue = getSortValue(b, state.sortKey);

    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });
}
