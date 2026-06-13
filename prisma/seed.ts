import { PrismaClient } from '@/prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  // ── Users ──
  // Existing bcrypt hashes from data/users.json are preserved
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
  await prisma.project.upsert({
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
        "Built a server-side Blazor application with a .NET 8 REST API backend. MongoDB stores flexible document-based content. Role-based access control separates editors, authors and admins. Real-time status updates handled via Blazor's SignalR integration.",
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

  // ── Blog posts (published only) ──
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
