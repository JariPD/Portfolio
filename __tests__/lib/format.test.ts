import { formatProjectDate } from "@/lib/format";

describe("formatProjectDate", () => {
  test("returns an empty string when the year is missing", () => {
    expect(formatProjectDate(null, null)).toBe("");
    expect(formatProjectDate(null, 5)).toBe("");
  });

  test("returns just the year when the month is missing", () => {
    expect(formatProjectDate(2024, null)).toBe("2024");
  });

  test("returns 'Month YYYY' when both year and month are present", () => {
    expect(formatProjectDate(2024, 1)).toBe("January 2024");
    expect(formatProjectDate(2023, 12)).toBe("December 2023");
  });
});
