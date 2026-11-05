import {
  DEFAULT_TABLE_STATE,
  filterRows,
  parseTableState,
  serializeTableState,
  sortRows,
} from "./school-league-table";
import type { TableState } from "./school-league-table";

const baseState: TableState = {
  sortKey: "fiveYearAvg",
  sortDir: "desc",
  rcOnly: false,
  favOnly: false,
  search: "",
  favouriteIds: new Set(),
};

describe("sortRows", () => {
  it("places rows with a null value in the sorted column at the bottom, regardless of sort direction", () => {
    const rows = [
      { id: 1, school_name: "A", isRomanCatholic: false, scores: {}, fiveYearAvg: 10 },
      { id: 2, school_name: "B", isRomanCatholic: false, scores: {}, fiveYearAvg: null },
      { id: 3, school_name: "C", isRomanCatholic: false, scores: {}, fiveYearAvg: 5 },
    ];

    const descending = sortRows(rows, baseState).map((r) => r.id);
    expect(descending).toEqual([1, 3, 2]);

    const ascending = sortRows(rows, { ...baseState, sortDir: "asc" }).map(
      (r) => r.id
    );
    expect(ascending).toEqual([3, 1, 2]);
  });
});

describe("filterRows", () => {
  it("AND-combines the Roman Catholic, favourites-only, and search filters", () => {
    const rows = [
      {
        id: 1,
        school_name: "St Mary's RC Primary",
        isRomanCatholic: true,
        scores: {},
        fiveYearAvg: 90,
      },
      {
        id: 2,
        school_name: "St James Primary",
        isRomanCatholic: false,
        scores: {},
        fiveYearAvg: 80,
      },
      {
        id: 3,
        school_name: "St Peter's RC Primary",
        isRomanCatholic: true,
        scores: {},
        fiveYearAvg: 70,
      },
    ];

    // RC-only + search "st" matches both RC schools, but favOnly narrows to only id 3
    const result = filterRows(rows, {
      ...baseState,
      rcOnly: true,
      favOnly: true,
      search: "st",
      favouriteIds: new Set([3]),
    });

    expect(result.map((r) => r.id)).toEqual([3]);
  });
});

describe("parseTableState", () => {
  it("returns the default state for empty search params, and reads every param when present", () => {
    expect(parseTableState(new URLSearchParams())).toEqual(
      DEFAULT_TABLE_STATE
    );

    const params = new URLSearchParams(
      "sort=fiveYearAvg&dir=desc&rc=1&favOnly=1&q=mary&favs=2&favs=5&favs=44"
    );
    expect(parseTableState(params)).toEqual({
      sortKey: "fiveYearAvg",
      sortDir: "desc",
      rcOnly: true,
      favOnly: true,
      search: "mary",
      favouriteIds: new Set([2, 5, 44]),
    });
  });
});

describe("serializeTableState", () => {
  it("omits default-valued fields entirely, and round-trips a non-default state through parseTableState", () => {
    expect(serializeTableState(DEFAULT_TABLE_STATE).toString()).toBe("");

    const state: TableState = {
      sortKey: "fiveYearAvg",
      sortDir: "desc",
      rcOnly: true,
      favOnly: true,
      search: "mary",
      favouriteIds: new Set([2, 5, 44]),
    };

    expect(parseTableState(serializeTableState(state))).toEqual(state);

    // Favourite ids are repeated params (favs=2&favs=5&favs=44), not a
    // comma-joined value, to keep the URL explicit rather than packing a
    // list into one delimited value.
    expect(serializeTableState(state).getAll("favs")).toEqual([
      "2",
      "5",
      "44",
    ]);
  });
});
