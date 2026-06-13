/** @jest-environment node */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
    },
  },
}))

import { getAllProjects } from '@/lib/projects'
import { prisma } from '@/lib/prisma'

function makeProject(overrides: Partial<{ project_id: string; title: string }> = {}) {
  return {
    project_id: 'uuid-1',
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project',
    technologies: ['TypeScript', 'React'],
    problem: null,
    approach: null,
    role: null,
    thumbnail_url: null,
    demo_url: null,
    repo_url: null,
    year: 2024,
    sort_order: 1,
    project_images: [],
    ...overrides,
  }
}

describe('getAllProjects()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Geeft alle projecten terug', async () => {
    const mockProjects = [
      makeProject({ project_id: 'uuid-1', title: 'Project A' }),
      makeProject({ project_id: 'uuid-2', title: 'Project B' }),
    ]
    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)

    const result = await getAllProjects()

    expect(result).toHaveLength(2)
  })

  test('Geeft een array van projecten terug', async () => {
    ;(prisma.project.findMany as jest.Mock).mockResolvedValue([])

    const result = await getAllProjects()

    expect(Array.isArray(result)).toBe(true)
  })

  test('Elk project bevat de verwachte velden', async () => {
    ;(prisma.project.findMany as jest.Mock).mockResolvedValue([
      makeProject({ project_id: 'uuid-1', title: 'Project A' }),
    ])

    const result = await getAllProjects()

    result.forEach((project) => {
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('shortDescription')
      expect(project).toHaveProperty('tech')
      expect(project).toHaveProperty('year')
    })
  })

  test('Geeft referentie naar de correcte gemapte data', async () => {
    ;(prisma.project.findMany as jest.Mock).mockResolvedValue([
      makeProject({ project_id: 'uuid-1', title: 'Project A' }),
      makeProject({ project_id: 'uuid-2', title: 'Project B' }),
    ])

    const result = await getAllProjects()

    expect(result[0].title).toBe('Project A')
    expect(result[result.length - 1].id).toBe('uuid-2')
  })
})
