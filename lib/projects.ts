import {revalidateTag, unstable_cache} from 'next/cache'
import { Prisma } from '@/prisma/generated/prisma/client'
import { prisma } from './prisma'

type PrismaProject = Prisma.ProjectGetPayload<{ include: { project_images: true } }>

export type Project = {
  id: string
  title: string
  slug: string
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
  sort_order: number
}

export type ProjectInput = {
  title: string
  slug?: string
  description: string
  problem?: string
  approach?: string
  role?: string
  technologies?: string[]
  thumbnail_url?: string
  demo_url?: string
  repo_url?: string
  year?: number
  month?: number
  sort_order?: number
  images?: { url: string; alt_text?: string; sort_order?: number }[]
}


function mapProject(p: PrismaProject): Project {
  return {
    id: p.project_id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.description,
    tech: p.technologies,
    problem: p.problem,
    approach: p.approach,
    role: p.role,
    thumbnail: p.thumbnail_url,
    images: [...p.project_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url),
    demoUrl: p.demo_url,
    githubUrl: p.repo_url,
    year: p.year,
    month: p.month,
    sort_order: p.sort_order,
  }
}

export const getAllProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const projects = await prisma.project.findMany({
      include: { project_images: true },
      orderBy: { sort_order: 'asc' },
    })
    return projects.map(mapProject)
  },
  ['projects'],
  { revalidate: 60 }
)

export async function getProjectById(id: string): Promise<Project | undefined> {
  const project = await prisma.project.findUnique({
    where: { project_id: id },
    include: { project_images: true },
  })
  return project ? mapProject(project) : undefined
}

export async function createProject(data: ProjectInput): Promise<Project> {
  const { images, slug: providedSlug, ...rest } = data
  const slug = providedSlug ?? rest.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const project = await prisma.project.create({
    data: {
      ...rest,
      slug,
      technologies: rest.technologies ?? [],
      project_images: images ? { create: images } : undefined,
    },
    include: { project_images: true },
  })
  revalidateTag('projects', 'max')
  return mapProject(project)
}

export async function updateProject(
  id: string,
  data: Partial<ProjectInput>
): Promise<Project | null> {
  const { images, ...rest } = data
  try {
    const project = await prisma.project.update({
      where: { project_id: id },
      data: {
        ...rest,
        ...(images !== undefined && {
          project_images: { deleteMany: {}, create: images },
        }),
      },
      include: { project_images: true },
    })
    revalidateTag('projects', 'max')
    return mapProject(project)
    
  } catch {
    return null
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { project_id: id } })
    revalidateTag('projects', 'max')
    return true
  } catch {
    return false
  }
}
