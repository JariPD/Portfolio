import { revalidateTag, unstable_cache } from 'next/cache'
import { prisma } from './prisma'

export type Status = 'published' | 'pending' | 'rejected'

export type BlogPost = {
  id: string
  userId: string
  title: string
  slug: string
  author: string
  authorName: string
  date: string
  status: Status
  preview: string
  content: string
}

type PrismaPost = {
  blog_id: string
  user_id: string
  title: string
  slug: string
  content: string
  status: string
  created_at: Date
  user: { email: string; name: string }
}

function mapPost(post: PrismaPost): BlogPost {
  return {
    id: post.blog_id,
    userId: post.user_id,
    title: post.title,
    slug: post.slug,
    author: post.user.email,
    authorName: post.user.name,
    date: post.created_at.toISOString().split('T')[0],
    status: post.status as Status,
    preview: post.content.slice(0, 200),
    content: post.content,
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    include: { user: true },
    orderBy: { created_at: 'desc' },
  })
  return posts.map(mapPost)
}

export const getPublishedPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      include: { user: true },
      orderBy: { created_at: 'desc' },
    })
    return posts.map(mapPost)
  },
  ['published-posts'],
  { revalidate: 60 }
)

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { user: true },
  })
  return post ? mapPost(post) : undefined
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const post = await prisma.blogPost.findUnique({
    where: { blog_id: id },
    include: { user: true },
  })
  return post ? mapPost(post) : undefined
}

export async function getPostsByAuthor(email: string): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { user: { email } },
    include: { user: true },
    orderBy: { created_at: 'desc' },
  })
  return posts.map(mapPost)
}

export async function createPost(data: {
  userEmail: string
  title: string
  slug: string
  content: string
}): Promise<BlogPost> {
  const user = await prisma.user.findUnique({ where: { email: data.userEmail } })
  if (!user) throw new Error('User not found')
  const post = await prisma.blogPost.create({
    data: {
      user_id: user.user_id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: 'pending',
    },  
    include: { user: true },
  })
  revalidateTag('published-posts', 'max')
  return mapPost(post)
}

export async function updatePostStatus(id: string, status: Status): Promise<boolean> {
  try {
    await prisma.blogPost.update({ where: { blog_id: id }, data: { status } })
    revalidateTag('published-posts', 'max')
    return true
  } catch {
    return false
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await prisma.blogPost.delete({ where: { blog_id: id } })
    revalidateTag('published-posts', 'max')
    return true
  } catch {
    return false
  }
}
