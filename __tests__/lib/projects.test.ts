import { selectFeatured, sortProjectsByNewest, type Project } from "@/lib/projects";

const make = (id: number, featured: boolean): Project => ({
  id,
  title: `P${id}`,
  shortDescription: "",
  tech: [],
  problem: null,
  approach: null,
  role: null,
  thumbnail: null,
  media: [],
  demoUrl: null,
  githubUrl: null,
  year: null,
  month: null,
  featured,
});

describe("selectFeatured", () => {
  test("returns only featured projects, preserving input order", () => {
    const input = [make(1, true), make(2, false), make(3, true)];
    expect(selectFeatured(input).map((p) => p.id)).toEqual([1, 3]);
  });

  test("falls back to all projects when none are featured", () => {
    const input = [make(1, false), make(2, false)];
    expect(selectFeatured(input).map((p) => p.id)).toEqual([1, 2]);
  });
});

describe("sortProjectsByNewest", () => {
  const dated = (id: number, year: number | null, month: number | null): Project => ({
    ...make(id, false),
    year,
    month,
  });

  test("orders by year descending", () => {
    const input = [dated(1, 2023, 1), dated(2, 2025, 1), dated(3, 2024, 1)];
    expect(sortProjectsByNewest(input).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  test("breaks year ties by month descending", () => {
    const input = [dated(1, 2024, 3), dated(2, 2024, 11), dated(3, 2024, 6)];
    expect(sortProjectsByNewest(input).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  test("sorts missing year/month last", () => {
    const input = [dated(1, null, null), dated(2, 2024, 6), dated(3, 2024, null)];
    expect(sortProjectsByNewest(input).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  test("does not mutate the input array", () => {
    const input = [dated(1, 2023, 1), dated(2, 2025, 1)];
    sortProjectsByNewest(input);
    expect(input.map((p) => p.id)).toEqual([1, 2]);
  });
});
