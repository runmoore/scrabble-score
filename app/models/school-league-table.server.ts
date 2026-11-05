import rawRecords from "~/data/school-league-table.json";

export type YearScores = Record<string, number | null>;

export type SchoolRecord = {
  id: number;
  school_name: string;
  isRomanCatholic: boolean;
  scores: YearScores;
};

export type SchoolRecordWithAverage = SchoolRecord & {
  fiveYearAvg: number | null;
};

export function computeFiveYearAverage(scores: YearScores): number | null {
  const values = Object.values(scores).filter(
    (value): value is number => value !== null
  );

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function getSchoolLeagueTableData(): SchoolRecordWithAverage[] {
  return (rawRecords as SchoolRecord[]).map((record) => ({
    ...record,
    fiveYearAvg: computeFiveYearAverage(record.scores),
  }));
}
