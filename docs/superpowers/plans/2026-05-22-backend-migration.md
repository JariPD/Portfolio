# Backend Migration: JSON → PostgreSQL (Prisma) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all JSON-file-based persistence with a PostgreSQL database via Prisma, keeping the existing frontend components intact.

**Architecture:** All data read/write goes through async lib functions (lib/blog.ts, lib/users.ts, lib/projects.ts) that wrap Prisma queries. API routes call lib functions for blog/user operations and call Prisma directly for new admin/project endpoints. Page components add `await` where needed.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma ORM, PostgreSQL (Neon), NextAuth v5 beta, bcryptjs, Resend

---

## File Map

### New files
- `prisma/schema.prisma` — Prisma schema (5 models)
- `lib/prisma.ts` — singleton PrismaClient for serverless
- `app/api/projects/route.ts` — GET (public) + POST (admin)
- `app/api/projects/[id]/route.ts` — PUT + DELETE (admin)
- `app/api/admin/users/[id]/posts/route.ts` — DELETE all posts by user (F27)
- `prisma/seed.ts` — seed existing JSON data
- `.env.example` — updated env template
- `BACKEND_PLAN.md` — ✅ already created

### Modified files
- `lib/users.ts` — async Prisma queries, add `createUser()`
- `lib/blog.ts` — async Prisma queries, add `createPost()`, add `authorName` to BlogPost type
- `lib/projects.ts` — async Prisma queries, add admin CRUD functions
- `auth.ts` — add `await` to `getUserByEmail()` call
- `app/api/auth/register/route.ts` — remove fs, use `createUser()`
- `app/api/blog/posts/route.ts` — use `createPost()`, drop `getAllPosts()`
- `app/api/blog/posts/[id]/route.ts` — remove `Number()` cast, add `await`
- `app/api/blog/posts/[id]/status/route.ts` — remove `Number()` cast, add `await`
- `app/api/contact/route.ts` — save to DB before Resend
- `app/page.tsx` — make async, add `await` to lib calls
- `app/admin/page.tsx` — add `await getAllPosts()`
- `app/dashboard/page.tsx` — add `await getPostsByAuthor()`
- `app/blog/[slug]/page.tsx` — add `await`, update `displayName` call
- `__tests__/lib/blog.test.ts` — mock Prisma instead of fs
- `__tests__/api/posts.test.ts` — mock `createPost` instead of `getAllPosts`/`appendPost`
- `__tests__/api/posts-status.test.ts` — string IDs, async mocks
- `__tests__/api/register.test.ts` — mock `createUser`, remove fs mock
- `__tests__/lib/projects.test.ts` — mock Prisma
- `package.json` — add `prisma.seed`, add `ts-node` devDep
- `.gitignore` — remove `*.md` line (blocks BACKEND_PLAN.md from being tracked)

---

## Task 1: Fix .gitignore and Create Prisma Schema

**Files:**
- Modify: `.gitignore:32`
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Remove `*.md` from .gitignore**

In `.gitignore`, remove line 32 (`*.md`) so BACKEND_PLAN.md and the plan file are tracked.

```
# Claude Code
.claude/
```

(Remove the `*.md` line that appears after `.claude/`)

- [ ] **Step 2: Write prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  user_id    String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String     @db.VarChar(100)
  email      String     @unique @db.VarChar(255)
  password   String     @db.VarChar(255)
  role       String     @default("user") @db.VarChar(20)
  created_at DateTime   @default(now())
  blog_posts BlogPost[]

  @@map("users")
}

model BlogPost {
  blog_id    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String   @db.Uuid
  title      String   @db.VarChar(255)
  slug       String   @unique @db.VarChar(255)
  content    String
  status     String   @default("pending") @db.VarChar(20)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  user       User     @relation(fields: [user_id], references: [user_id])

  @@map("blog_posts")
}

model Project {
  project_id     String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title          String         @db.VarChar(255)
  slug           String         @unique @db.VarChar(255)
  description    String
  problem        String?
  approach       String?
  role           String?
  technologies   String[]       @db.VarChar(50)
  thumbnail_url  String?        @db.VarChar(500)
  demo_url       String?        @db.VarChar(500)
  repo_url       String?        @db.VarChar(500)
  year           Int?           @db.SmallInt
  sort_order     Int            @default(0)
  created_at     DateTime       @default(now())
  updated_at     DateTime       @updatedAt
  project_images ProjectImage[]

  @@map("projects")
}

model ProjectImage {
  image_id   String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id String   @db.Uuid
  url        String   @db.VarChar(500)
  alt_text   String?  @db.VarChar(255)
  sort_order Int      @default(0)
  project    Project  @relation(fields: [project_id], references: [project_id], onDelete: Cascade)

  @@map("project_images")
}

model ContactMessage {
  message_id String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String   @db.VarChar(100)
  email      String   @db.VarChar(255)
  message    String
  created_at DateTime @default(now())

  @@map("contact_messages")
}
```

- [ ] **Step 3: Install Prisma and ts-node**

```bash
npm install prisma @prisma/client
npm install --save-dev ts-node
```

Expected: both packages appear in package.json.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma .gitignore package.json package-lock.json BACKEND_PLAN.md
git commit -m "feat: add Prisma schema and install dependencies"
```

---

## Task 2: Create lib/prisma.ts (Singleton Client)

**Files:**
- Create: `lib/prisma.ts`

- [ ] **Step 1: Write the singleton**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat: add Prisma singleton client for serverless"
```

---

## Task 3: Migrate lib/users.ts

**Files:**
- Modify: `lib/users.ts`

- [ ] **Step 1: Rewrite lib/users.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/users.ts
git commit -m "feat: migrate lib/users to Prisma (async)"
```

---

## Task 4: Update auth.ts and Register Route

**Files:**
- Modify: `auth.ts`
- Modify: `app/api/auth/register/route.ts`

- [ ] **Step 1: Add await to getUserByEmail in auth.ts**

In `auth.ts`, change line 12 from:
```typescript
const user = getUserByEmail(credentials.email as string);
```
to:
```typescript
const user = await getUserByEmail(credentials.email as string);
```

Full file after change:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { getUserByEmail } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email as string);
        if (!user) return null;
        const ok = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
```

- [ ] **Step 2: Rewrite register route**

Replace `app/api/auth/register/route.ts` entirely:

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/users";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (password.length < 5) {
    return NextResponse.json({ error: "Password must be at least 5 characters." }, { status: 400 });
  }

  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await createUser({ name, email, password: hashed });

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 3: Commit**

```bash
git add auth.ts app/api/auth/register/route.ts
git commit -m "feat: migrate auth and register route to Prisma"
```

---

## Task 5: Migrate lib/blog.ts

**Files:**
- Modify: `lib/blog.ts`

Key changes:
- All functions become async
- `id` type: `number` → `string` (UUID)
- Add `authorName: string` to BlogPost type (from user join)
- Add `createPost()` — replaces `appendPost()` + manual ID generation
- Remove `appendPost()`, `readPosts()`, `writePosts()`

- [ ] **Step 1: Rewrite lib/blog.ts**

```typescript
import { prisma } from './prisma'

export type Status = 'published' | 'pending' | 'rejected'

export type BlogPost = {
  id: string
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

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    include: { user: true },
    orderBy: { created_at: 'desc' },
  })
  return posts.map(mapPost)
}

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
  return mapPost(post)
}

export async function updatePostStatus(id: string, status: Status): Promise<boolean> {
  try {
    await prisma.blogPost.update({ where: { blog_id: id }, data: { status } })
    return true
  } catch {
    return false
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await prisma.blogPost.delete({ where: { blog_id: id } })
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/blog.ts
git commit -m "feat: migrate lib/blog to Prisma (async, UUID ids)"
```

---

## Task 6: Update Page Components

**Files:**
- Modify: `app/page.tsx:15-17`
- Modify: `app/admin/page.tsx:12`
- Modify: `app/dashboard/page.tsx:14`
- Modify: `app/blog/[slug]/page.tsx:19,27,37,45`

- [ ] **Step 1: Make app/page.tsx async**

Change line 15:
```typescript
// Before
export default function Home() {
  const projects = getAllProjects();
  const publishedPosts = getPublishedPosts();

// After
export default async function Home() {
  const projects = await getAllProjects();
  const publishedPosts = await getPublishedPosts();
```

- [ ] **Step 2: Add await in app/admin/page.tsx**

Change line 12:
```typescript
// Before
const posts = getAllPosts();

// After
const posts = await getAllPosts();
```

- [ ] **Step 3: Add await in app/dashboard/page.tsx**

Change line 14:
```typescript
// Before
const posts = getPostsByAuthor(session.user.email);

// After
const posts = await getPostsByAuthor(session.user.email);
```

- [ ] **Step 4: Update app/blog/[slug]/page.tsx**

Four changes in this file:

**generateMetadata (line 19):**
```typescript
// Before
const post = getPostBySlug(slug);

// After
const post = await getPostBySlug(slug);
```

**generateStaticParams (line 27):**
```typescript
// Before
export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

// After
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

**BlogPostPage body (line 37):**
```typescript
// Before
const post = getPostBySlug(slug);

// After
const post = await getPostBySlug(slug);
```

**displayName call (line 45):**
```typescript
// Before
const name = displayName(post.author);

// After
const name = displayName(post.author, post.authorName);
```

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/admin/page.tsx app/dashboard/page.tsx app/blog/[slug]/page.tsx
git commit -m "feat: add await to page components for async lib functions"
```

---

## Task 7: Update Blog API Routes

**Files:**
- Modify: `app/api/blog/posts/route.ts`
- Modify: `app/api/blog/posts/[id]/route.ts`
- Modify: `app/api/blog/posts/[id]/status/route.ts`

- [ ] **Step 1: Rewrite app/api/blog/posts/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPost } from "@/lib/blog";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { title, content } = await request.json();
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const post = await createPost({ userEmail: session.user.email, title, slug, content });

  return NextResponse.json({ success: true, post }, { status: 201 });
}
```

- [ ] **Step 2: Rewrite app/api/blog/posts/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deletePost, getPostById } from "@/lib/blog";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const isAdmin = session.user.role === "admin";
  const isOwner = post.author === session.user.email;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await deletePost(id);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Rewrite app/api/blog/posts/[id]/status/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updatePostStatus } from "@/lib/blog";
import type { Status } from "@/lib/blog";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["published", "pending", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await updatePostStatus(id, status as Status);
  if (!updated) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/blog/posts/route.ts app/api/blog/posts/[id]/route.ts app/api/blog/posts/[id]/status/route.ts
git commit -m "feat: migrate blog API routes to Prisma"
```

---

## Task 8: Migrate lib/projects.ts

**Files:**
- Modify: `lib/projects.ts`

The returned `Project` type keeps the old field names (`shortDescription`, `tech`, `thumbnail`, `images`, `demoUrl`, `githubUrl`) so existing components don't break. The lib maps internally from Prisma field names.

- [ ] **Step 1: Rewrite lib/projects.ts**

```typescript
import { prisma } from './prisma'

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
  sort_order?: number
  images?: { url: string; alt_text?: string; sort_order?: number }[]
}

type PrismaProject = {
  project_id: string
  title: string
  slug: string
  description: string
  technologies: string[]
  problem: string | null
  approach: string | null
  role: string | null
  thumbnail_url: string | null
  demo_url: string | null
  repo_url: string | null
  year: number | null
  sort_order: number
  project_images: { url: string; sort_order: number }[]
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
    images: p.project_images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url),
    demoUrl: p.demo_url,
    githubUrl: p.repo_url,
    year: p.year,
    sort_order: p.sort_order,
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    include: { project_images: true },
    orderBy: { sort_order: 'asc' },
  })
  return projects.map(mapProject)
}

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
    return mapProject(project)
  } catch {
    return null
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { project_id: id } })
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/projects.ts
git commit -m "feat: migrate lib/projects to Prisma with admin CRUD functions"
```

---

## Task 9: Create Project API Routes

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[id]/route.ts`

- [ ] **Step 1: Create app/api/projects/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllProjects, createProject } from "@/lib/projects";

export async function GET() {
  const projects = await getAllProjects();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 }
    );
  }

  const project = await createProject(body);
  return NextResponse.json({ success: true, project }, { status: 201 });
}
```

- [ ] **Step 2: Create app/api/projects/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateProject, deleteProject } from "@/lib/projects";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const project = await updateProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, project });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteProject(id);
  if (!deleted) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/projects/route.ts app/api/projects/[id]/route.ts
git commit -m "feat: add project CRUD API routes (admin-protected)"
```

---

## Task 10: Update Contact Route + Create Admin Bulk Delete

**Files:**
- Modify: `app/api/contact/route.ts`
- Create: `app/api/admin/users/[id]/posts/route.ts`

- [ ] **Step 1: Update contact route**

Replace `app/api/contact/route.ts` entirely:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: { name, email, message } });

  const { error } = await resend.emails.send({
    from: "Contact Form <noreply@jaridijk.nl>",
    to: [process.env.CONTACT_EMAIL!],
    replyTo: email,
    subject: `New contact form submission from ${escape(name)}`,
    html: `
      <p><strong>Name:</strong> ${escape(name)}</p>
      <p><strong>Email:</strong> ${escape(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escape(message).replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json({
      success: true,
      warning: "Message saved but email delivery failed.",
    });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create admin bulk delete route (F27)**

Create directory `app/api/admin/users/[id]/posts/` and write `route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { user_id: id } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const result = await prisma.blogPost.deleteMany({ where: { user_id: id } });

  return NextResponse.json({ success: true, deleted: result.count });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/contact/route.ts app/api/admin/users/[id]/posts/route.ts
git commit -m "feat: save contact messages to DB, add admin bulk-delete posts route"
```

---

## Task 11: Update Tests

**Files:**
- Modify: `__tests__/lib/blog.test.ts`
- Modify: `__tests__/api/posts.test.ts`
- Modify: `__tests__/api/posts-status.test.ts`
- Modify: `__tests__/api/register.test.ts`

- [ ] **Step 1: Rewrite __tests__/lib/blog.test.ts**

```typescript
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
```

- [ ] **Step 2: Rewrite __tests__/api/posts.test.ts**

The route now uses `createPost()` instead of `getAllPosts()` + `appendPost()`. Mock `createPost` and verify it receives the correct slug.

```typescript
/** @jest-environment node */
import { NextRequest } from 'next/server'

jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/lib/blog', () => ({ createPost: jest.fn() }))

import { POST } from '@/app/api/blog/posts/route'
import { auth } from '@/auth'
import { createPost } from '@/lib/blog'

function makeRequest(body: Record<string, string>) {
  return new NextRequest('http://localhost/api/blog/posts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockPost = (slug: string, title: string) => ({
  id: 'uuid-1',
  title,
  slug,
  author: 'auteur@test.com',
  authorName: 'Auteur',
  date: '2024-01-01',
  status: 'pending',
  preview: 'Inhoud van de post.',
  content: 'Inhoud van de post.',
})

describe('app/api/blog/posts — POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({ user: { email: 'auteur@test.com' } })
    ;(createPost as jest.Mock).mockImplementation(({ slug, title }) =>
      Promise.resolve(mockPost(slug, title))
    )
  })

  test('Nieuwe post krijgt status pending', async () => {
    const res = await POST(makeRequest({ title: 'Mijn Post', content: 'Inhoud van de post.' }))
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.post.status).toBe('pending')
  })

  test('Post bevat correct gegenereerde slug op basis van titel', async () => {
    const res = await POST(
      makeRequest({ title: 'Mijn Eerste Blog Post!', content: 'Inhoud van de post.' })
    )
    expect(res.status).toBe(201)
    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'mijn-eerste-blog-post' })
    )
  })

  test('Slug bevat geen speciale tekens of hoofdletters', async () => {
    await POST(makeRequest({ title: 'Hello World & More', content: 'Inhoud.' }))
    const [call] = (createPost as jest.Mock).mock.calls
    expect(call[0].slug).toMatch(/^[a-z0-9-]+$/)
  })

  test('Geeft 401 terug zonder sessie', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeRequest({ title: 'Test', content: 'Inhoud.' }))
    expect(res.status).toBe(401)
  })

  test('Geeft 400 terug bij ontbrekende titel of inhoud', async () => {
    const res = await POST(makeRequest({ title: '', content: 'Inhoud.' }))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 3: Update __tests__/api/posts-status.test.ts**

Two changes: mock returns `mockResolvedValue` (async), and ID expectations use string `'1'` not number `1`.

Change these lines in the existing file:

```typescript
// Line 10 — mock now returns Promise
(updatePostStatus as jest.Mock).mockResolvedValue(true);

// Line 39 — string ID, not Number
expect(updatePostStatus).toHaveBeenCalledWith('1', 'published');

// Line 50 — string ID
expect(updatePostStatus).toHaveBeenCalledWith('2', 'rejected');

// Line 68 — async false
(updatePostStatus as jest.Mock).mockResolvedValue(false);
```

Full updated file:

```typescript
/** @jest-environment node */
import { NextRequest } from "next/server";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/blog", () => ({
  updatePostStatus: jest.fn(),
}));

import { PATCH } from "@/app/api/blog/posts/[id]/status/route";
import { auth } from "@/auth";
import { updatePostStatus } from "@/lib/blog";

function makeRequest(body: Record<string, string>) {
  return new NextRequest("http://localhost/api/blog/posts/1/status", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("app/api/blog/posts/[id]/status — PATCH", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { role: "admin" } });
    (updatePostStatus as jest.Mock).mockResolvedValue(true);
  });

  test("Status wordt correct bijgewerkt naar 'published'", async () => {
    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updatePostStatus).toHaveBeenCalledWith("1", "published");
  });

  test("Status wordt correct bijgewerkt naar 'rejected'", async () => {
    const res = await PATCH(makeRequest({ status: "rejected" }), {
      params: Promise.resolve({ id: "2" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updatePostStatus).toHaveBeenCalledWith("2", "rejected");
  });

  test("Geeft 403 terug als gebruiker geen admin is", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { role: "user" } });

    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(res.status).toBe(403);
  });

  test("Geeft 400 terug bij ongeldige status", async () => {
    const res = await PATCH(makeRequest({ status: "archived" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(res.status).toBe(400);
  });

  test("Geeft 404 terug als post niet bestaat", async () => {
    (updatePostStatus as jest.Mock).mockResolvedValue(false);

    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "999" }),
    });

    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 4: Rewrite __tests__/api/register.test.ts**

Remove `fs` mock, add `createUser` mock, change `getUserByEmail` to `mockResolvedValue`:

```typescript
/** @jest-environment node */
import { NextRequest } from "next/server";

jest.mock("@/lib/users", () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

import { getUserByEmail, createUser } from "@/lib/users";
import { POST } from "@/app/api/auth/register/route";

function makeRequest(body: Record<string, string>) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("app/api/auth/register — validatie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserByEmail as jest.Mock).mockResolvedValue(undefined);
    (createUser as jest.Mock).mockResolvedValue({
      id: "uuid-1",
      email: "test@test.com",
      name: "Test",
      role: "user",
      password: "hashed-password",
    });
  });

  test("Foutmelding bij ontbrekend e-mailadres", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "", password: "secret123" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("All fields are required.");
  });

  test("Foutmelding bij ontbrekend wachtwoord", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("All fields are required.");
  });

  test("Foutmelding als wachtwoord korter is dan 5 karakters", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "abc" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Password must be at least 5 characters.");
  });

  test("Wachtwoord van exact 5 karakters is geldig", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "abcde" })
    );

    expect(res.status).toBe(201);
  });
});
```

- [ ] **Step 5: Run tests and verify they pass**

```bash
npx jest --no-coverage
```

Expected: all tests pass (note: Prisma client won't actually connect since it's mocked).

- [ ] **Step 6: Commit**

```bash
git add __tests__/lib/blog.test.ts __tests__/api/posts.test.ts __tests__/api/posts-status.test.ts __tests__/api/register.test.ts
git commit -m "test: update test mocks for Prisma migration"
```

---

## Task 12: Create prisma/seed.ts

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write the seed file**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Users ──
  const admin = await prisma.user.upsert({
    where: { email: 'jari@email.nl' },
    update: {},
    create: {
      name: 'Jari Dijk',
      email: 'jari@email.nl',
      password: '$2b$10$TFK1O3ZN/Sa3QLHXeB/skOoYcPIuAlBbvAm7dtstR9W7Bxf.CCnMm',
      role: 'admin',
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@email.nl' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'user@email.nl',
      password: '$2b$10$TFK1O3ZN/Sa3QLHXeB/skOoYcPIuAlBbvAm7dtstR9W7Bxf.CCnMm',
      role: 'user',
    },
  })

  await prisma.user.upsert({
    where: { email: '12345@email.nl' },
    update: {},
    create: {
      name: 'test',
      email: '12345@email.nl',
      password: '$2b$10$8b3aGgjYE2yklsJ2xIFkLejLpXV68Qo/H334WcrJ3hiBl5R4OMSLS',
      role: 'user',
    },
  })

  // ── Projects ──
  const cmsProject = await prisma.project.upsert({
    where: { slug: 'content-management-dashboard' },
    update: {},
    create: {
      title: 'Content Management Dashboard',
      slug: 'content-management-dashboard',
      description:
        'A full-featured CMS dashboard for managing articles, authors and publishing workflows built with Blazor and .NET.',
      technologies: ['Blazor', 'C#', '.NET', 'MongoDB', 'REST API'],
      problem:
        'A publishing company needed a centralised platform to manage their editorial workflow — from draft creation to scheduled publishing — replacing a patchwork of spreadsheets and email chains.',
      approach:
        'Built a server-side Blazor application with a .NET 8 REST API backend. MongoDB stores flexible document-based content. Role-based access control separates editors, authors and admins. Real-time status updates handled via Blazor’s SignalR integration.',
      role: 'Full-stack developer — responsible for the full architecture, API design, MongoDB schema and Blazor component library.',
      thumbnail_url: 'https://picsum.photos/seed/cms-thumb/800/450',
      demo_url: '#',
      repo_url: '#',
      year: 2026,
      sort_order: 0,
      project_images: {
        create: [
          { url: 'https://picsum.photos/seed/cms-1/800/500', sort_order: 0 },
          { url: 'https://picsum.photos/seed/cms-2/800/500', sort_order: 1 },
          { url: 'https://picsum.photos/seed/cms-3/800/500', sort_order: 2 },
          { url: 'https://picsum.photos/seed/cms-4/800/500', sort_order: 3 },
          { url: 'https://picsum.photos/seed/cms-5/800/500', sort_order: 4 },
          { url: 'https://picsum.photos/seed/cms-6/800/500', sort_order: 5 },
        ],
      },
    },
  })

  await prisma.project.upsert({
    where: { slug: '2d-platformer-voidrun' },
    update: {},
    create: {
      title: '2D Platformer — Voidrun',
      slug: '2d-platformer-voidrun',
      description:
        'A fast-paced 2D platformer built in Unity with procedurally generated levels, a combo system and online leaderboards.',
      technologies: ['Unity', 'C#', 'REST API'],
      problem:
        'Developed as a graduation project during my MBO Game Development programme. The goal was to ship a complete, polished game loop with replayability beyond a fixed level set.',
      approach:
        'Procedural level generation using a tile-chunk system in C#. Physics-based movement with coyote time and input buffering for responsive controls. Score submission handled via a lightweight REST API, with a live leaderboard fetched on the main menu.',
      role: 'Solo developer — game design, all Unity systems, procedural generation algorithm and backend leaderboard API.',
      thumbnail_url: 'https://picsum.photos/seed/voidrun-thumb/800/450',
      demo_url: '#',
      repo_url: '#',
      year: 2024,
      sort_order: 1,
      project_images: {
        create: [
          { url: 'https://picsum.photos/seed/voidrun-1/800/500', sort_order: 0 },
          { url: 'https://picsum.photos/seed/voidrun-2/800/500', sort_order: 1 },
          { url: 'https://picsum.photos/seed/voidrun-3/800/500', sort_order: 2 },
        ],
      },
    },
  })

  await prisma.project.upsert({
    where: { slug: 'analytics-dashboard' },
    update: {},
    create: {
      title: 'Analytics Dashboard',
      slug: 'analytics-dashboard',
      description:
        'An interactive data dashboard with real-time charts, filterable tables and export functionality for business reporting.',
      technologies: ['Blazor', 'C#', '.NET', 'ApexCharts', 'MongoDB'],
      problem:
        'A client needed to consolidate data from multiple internal tools into a single, readable overview — with the ability to filter by date range, category and region without involving a developer.',
      approach:
        'Blazor WebAssembly frontend consuming a .NET REST API. ApexCharts integrated for interactive line, bar and pie charts with live filtering. Data is stored in MongoDB and aggregated server-side before being passed to the client as typed DTOs.',
      role: 'Full-stack developer — API design, MongoDB aggregation pipelines, Blazor component architecture and ApexCharts integration.',
      thumbnail_url: 'https://picsum.photos/seed/analytics-thumb/800/450',
      demo_url: '#',
      repo_url: '#',
      year: 2025,
      sort_order: 2,
      project_images: {
        create: [
          { url: 'https://picsum.photos/seed/analytics-1/800/500', sort_order: 0 },
          { url: 'https://picsum.photos/seed/analytics-2/800/500', sort_order: 1 },
          { url: 'https://picsum.photos/seed/analytics-3/800/500', sort_order: 2 },
        ],
      },
    },
  })

  // ── Blog posts ──
  await prisma.blogPost.upsert({
    where: { slug: 'getting-started-with-react-hooks' },
    update: {},
    create: {
      user_id: admin.user_id,
      title: 'Getting Started with React Hooks',
      slug: 'getting-started-with-react-hooks',
      content:
        'React Hooks were introduced in React 16.8 and have completely changed the way we write functional components. Previously you needed class components for state and lifecycle methods, but now you can do all of this with functions.\n\nuseState is the most commonly used hook. You call it with an initial value and get back an array containing the current value and a setter function. useEffect replaces componentDidMount, componentDidUpdate and componentWillUnmount in one elegant API.\n\nIn this article I show how I use hooks in my projects and what pitfalls I ran into along the way.',
      status: 'published',
    },
  })

  await prisma.blogPost.upsert({
    where: { slug: 'typescript-for-beginners' },
    update: {},
    create: {
      user_id: admin.user_id,
      title: 'TypeScript for Beginners',
      slug: 'typescript-for-beginners',
      content:
        'Six months ago I decided to make the switch from plain JavaScript to TypeScript. The learning curve was steeper than I expected, but the benefits are enormous.\n\nThe biggest advantage is IDE support. With TypeScript you get autocompletion that actually works, and errors are caught while you type instead of at runtime. This has significantly boosted my productivity.\n\nType annotations also act as living documentation. When I see a function with clear parameter and return types, I immediately understand what it does without having to read the implementation.',
      status: 'published',
    },
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add Prisma seed file with existing JSON data"
```

---

## Task 13: Update package.json and .env.example

**Files:**
- Modify: `package.json`
- Create: `.env.example`

- [ ] **Step 1: Add prisma.seed to package.json**

In `package.json`, add after the `"scripts"` block:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 2: Create .env.example**

```
# PostgreSQL (Neon)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Resend (contact form email)
RESEND_API_KEY="your-resend-key"

# Contact form recipient
CONTACT_EMAIL="your-email@example.com"
```

- [ ] **Step 3: Verify .env is in .gitignore**

```bash
grep "^\.env" .gitignore
```

Expected output includes `.env*`.

- [ ] **Step 4: Commit**

```bash
git add package.json .env.example
git commit -m "chore: add Prisma seed config and .env.example"
```

---

## Self-Review

### Spec coverage check

| Requirement | Task |
|---|---|
| prisma/schema.prisma | Task 1 |
| lib/prisma.ts singleton | Task 2 |
| lib/users.ts Prisma | Task 3 |
| auth.ts credentials | Task 4 |
| register route | Task 4 |
| lib/blog.ts Prisma | Task 5 |
| Page components async | Task 6 |
| Blog API routes | Task 7 |
| lib/projects.ts Prisma | Task 8 |
| GET/POST /api/projects | Task 9 |
| PUT/DELETE /api/projects/[id] | Task 9 |
| POST /api/contact (DB first) | Task 10 |
| DELETE /api/admin/users/[id]/posts (F27) | Task 10 |
| Tests updated | Task 11 |
| prisma/seed.ts | Task 12 |
| .env.example | Task 13 |
| BACKEND_PLAN.md | Pre-existing ✅ |
| OWASP A01 auth checks | All write routes ✅ |
| OWASP A02 bcrypt | Task 4 register (rounds=12) ✅ |
| OWASP A03 Prisma (no raw SQL) | All lib functions ✅ |
| OWASP A05 no stack traces | All routes return generic 500 ✅ |

### Placeholder check
No TBD, TODO, or "similar to task N" patterns found.

### Type consistency check
- `BlogPost.id: string` — used as string in all routes and tests ✅
- `updatePostStatus(id: string, status)` — test expects `('1', 'published')` (string) ✅
- `createPost({ userEmail, title, slug, content })` — matches usage in posts route ✅
- `mapPost()` takes `PrismaPost` type — matches Prisma `include: { user: true }` output shape ✅
- `Project.shortDescription` — mapped from `description` in `mapProject()` ✅

### Known remaining work (outside plan scope)
- `__tests__/lib/projects.test.ts` — content unknown; update similarly to blog.test.ts (mock `@/lib/prisma` instead of static import)
- `__tests__/components/*.test.tsx` — these test UI components, not lib/API; likely unaffected
