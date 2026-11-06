import { computeFiveYearAverage } from "./school-league-table.server";

describe("computeFiveYearAverage", () => {
  it("excludes null years from both the sum and the count, rather than treating them as zero", () => {
    expect(
      computeFiveYearAverage({
        "2020/21": null,
        "2021/22": null,
        "2022/23": 95,
        "2023/24": 95,
        "2024/25": 95,
      })
    ).toBe(95);
  });
});
