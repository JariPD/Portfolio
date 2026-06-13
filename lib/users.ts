import { prisma } from './prisma'

export type User = {
  id: string
  email: string
  password: string
  role: 'user' | 'admin'
  name: string
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return undefined
  return {
    id: user.user_id,
    email: user.email,
    password: user.password,
    role: user.role as 'user' | 'admin',
    name: user.name,
  }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'user',
    },
  })
  return {
    id: user.user_id,
    email: user.email,
    password: user.password,
    role: user.role as 'user' | 'admin',
    name: user.name,
  }
}

export function displayName(email: string, name?: string): string {
  return name ?? email.split('@')[0]
}
