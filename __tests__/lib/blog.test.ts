/** @jest-environment node */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    blogPost: {
      findMany: jest.fn(),
    },
  },
}))

import { getPublishedPosts } from '@/lib/blog'
import { prisma } from '@/lib/prisma'

function makePost(overrides: Partial<{
  blog_id: string
  status: string
}> = {}) {
  return {
    blog_id: 'uuid-1',
    title: 'Test Post',
    slug: 'test-post',
    content: 'Content here',
    status: 'published',
    created_at: new Date('2024-01-01'),
    user: { email: 'a@b.com', name: 'Test User' },
    ...overrides,
  }
}

describe('getPublishedPosts()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Geeft alleen posts terug met status published', async () => {
    ;(prisma.blogPost.findMany as jest.Mock).mockResolvedValue([
      makePost({ blog_id: 'uuid-1' }),
      makePost({ blog_id: 'uuid-2' }),
    ])
    const result = await getPublishedPosts()
    expect(result.every((p) => p.status === 'published')).toBe(true)
  })

  test('Geeft geen pending of rejected posts terug', async () => {
    ;(prisma.blogPost.findMany as jest.Mock).mockResolvedValue([
      makePost({ blog_id: 'uuid-1' }),
    ])
    const result = await getPublishedPosts()
    expect(result.some((p) => p.status === 'pending')).toBe(false)
    expect(result.some((p) => p.status === 'rejected')).toBe(false)
  })

  test('Geeft het juiste aantal gepubliceerde posts terug', async () => {
    ;(prisma.blogPost.findMany as jest.Mock).mockResolvedValue([
      makePost({ blog_id: 'uuid-1' }),
      makePost({ blog_id: 'uuid-2' }),
    ])
    const result = await getPublishedPosts()
    expect(result).toHaveLength(2)
  })

  test('Geeft lege array terug als er geen gepubliceerde posts zijn', async () => {
    ;(prisma.blogPost.findMany as jest.Mock).mockResolvedValue([])
    const result = await getPublishedPosts()
    expect(result).toHaveLength(0)
  })
})
