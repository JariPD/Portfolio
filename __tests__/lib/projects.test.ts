import { selectFeatured, type Project } from "@/lib/projects";

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
