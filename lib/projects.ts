import projectsData from '@/data/projects.json'

// Discriminated union for project gallery media. `image` = next/image, `video` =
// self-hosted file, `embed` = external platform (YouTube/Vimeo). New variants drop
// in here without touching call sites.
export type MediaItem =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string; poster: string; alt?: string; loop?: boolean; autoPlay?: boolean }
  | { type: 'embed'; provider: 'youtube' | 'vimeo'; id: string; poster?: string; title?: string }

export type Project = {
  id: number
  title: string
  shortDescription: string
  tech: string[]
  problem: string | null
  approach: string | null
  role: string | null
  thumbnail: string | null
  media: MediaItem[]
  demoUrl: string | null
  githubUrl: string | null
  year: number | null
  month: number | null
  featured?: boolean
}

// Thumbnail/poster image for a media item, used by the gallery thumb strip.
// YouTube exposes a static thumbnail by video id; Vimeo needs an explicit poster.
// Use maxresdefault (native 16:9, high-res) rather than hqdefault, which is a 4:3
// image with baked-in black letterbox bars that object-fit:cover can't fully crop.
export function mediaThumb(item: MediaItem): string {
  switch (item.type) {
    case 'image':
      return item.src
    case 'video':
      return item.poster
    case 'embed':
      return item.poster ?? (item.provider === 'youtube' ? `https://img.youtube.com/vi/${item.id}/maxresdefault.jpg` : '')
  }
}

// Data-access boundary (repository). Reads the static JSON source today; swapping
// to a real API later only changes this file. Newest projects first.
export async function getAllProjects(): Promise<Project[]> {
  // JSON imports widen the `media[].type` literals to `string`, so cast through unknown.
  const projects = projectsData as unknown as Project[]
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
