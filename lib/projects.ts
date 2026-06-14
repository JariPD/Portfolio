import projectsData from '@/data/projects.json'

export type Project = {
  id: number
  title: string
  shortDescription: string
  tech: string[]
  problem: string | null
  approach: string | null
  role: string | null
  thumbnail: string | null
  images: string[]
  demoUrl: string | null
  githubUrl: string | null
  year: number | null
  month: number | null
  featured?: boolean
}

// Data-access boundary (repository). Reads the static JSON source today; swapping
// to a real API later only changes this file. Newest projects first.
export async function getAllProjects(): Promise<Project[]> {
  const projects = projectsData as Project[]
  return [...projects].sort((a, b) => {
    const byYear = (b.year ?? 0) - (a.year ?? 0)
    if (byYear !== 0) return byYear
    return (b.month ?? 0) - (a.month ?? 0)
  })
}

// Featured = explicitly flagged in the JSON. Falls back to all projects when nothing
// is flagged, so the home page never renders an empty grid. Pure + array-in/array-out
// so the selection logic is unit-testable without touching the data source.
export function selectFeatured(projects: Project[]): Project[] {
  const featured = projects.filter((p) => p.featured)
  return featured.length > 0 ? featured : projects
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return selectFeatured(await getAllProjects())
}
