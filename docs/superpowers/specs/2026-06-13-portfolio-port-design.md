# Portfolio Port — Design

**Date:** 2026-06-13
**Source:** `~/RiderProjects/Next.js` (school portfolio, over-built)
**Target:** `~/RiderProjects/Portfolio` (empty repo, Next.js `.gitignore` only)

## Goal

Port the portfolio-relevant parts of the Next.js school project into the Portfolio
repo, stripped of blog, login/auth, database, redis, swagger, and self-facing API
routes. Data becomes JSON-backed. Result is a static-leaning portfolio site with one
server-side concern: the contact form.

## Approach

**Approach A — copy whole project, strip in place.** Copy everything from the source
(except `.git`, `node_modules`, `.next`, `.swc`, build artifacts) into Portfolio, then
delete unwanted files, rewrite two files, prune `package.json`. Config, CSS, and assets
carry over byte-identical — lowest risk of breaking the existing design. Rejected
alternative: fresh `create-next-app` + selective copy (more config reconciliation, risk
of Next version drift vs the current Next 16 setup).

## Data flow (Next.js standard)

The source copied a C# `Component → Service → API Controller → DbContext` layering
literally (`page → fetch('/api/projects') → route handler → Prisma`). The redundant
layer is the self-facing HTTP hop. Idiomatic App Router collapses it:

| C# layer            | Next.js equivalent                          | Portfolio file              |
|---------------------|---------------------------------------------|-----------------------------|
| Component           | Server Component (async page, server-run)   | `app/page.tsx`              |
| Repository/Service  | Data-access module (the boundary)           | `lib/projects.ts`           |
| API Controller      | Route Handler — *only for HTTP-facing needs*| `app/api/contact/route.ts`  |
| DbContext           | data source                                 | `data/projects.json`        |

**Rule:** a Server Component reads data by calling the data-access function directly —
no `fetch`, no internal API route. A Route Handler exists only when the call must cross
HTTP (client mutation, webhook, external consumer).

- **Projects / skills** → direct read in the Server Component. `app/api/projects/*` is
  deleted.
- **Contact** → the one legitimate Route Handler: a browser form POST that sends mail.
- `lib/projects.ts` stays as the repository boundary so a future swap (JSON → real API)
  touches only that file. The C# repository pattern is preserved — minus the controller.

Contact stays a Route Handler with manual `fetch` (current code). Server Action is the
modern alternative but out of scope for this port.

## File plan

### Rewrite (2)

- **`lib/projects.ts`** — drop Prisma. `import projects from '@/data/projects.json'`.
  Trim the `Project` type to UI-used fields only:
  `id, title, shortDescription, tech, problem, approach, role, thumbnail, images, demoUrl, githubUrl, year, month`.
  (`slug`, `sort_order`, `color` are unused by `ProjectCard`/`ProjectModal`.) Keep a
  single `getAllProjects()` returning the JSON, sorted by `year`/`month` descending.
  Remove `getProjectById`, `createProject`, `updateProject`, `deleteProject`.
- **`app/api/contact/route.ts`** — Resend only. Remove the
  `prisma.contactMessage.create(...)` call and the `@/lib/prisma` import. Keep
  validation + email send. Requires `RESEND_API_KEY` and `CONTACT_EMAIL` env.

### Delete

- Dirs: `app/admin`, `app/blog`, `app/dashboard`, `app/login`, `app/docs`,
  `app/api/admin`, `app/api/auth`, `app/api/blog`, `app/api/projects`, `prisma/`
- Root files: `auth.ts`, `auth.config.ts`, `proxy.ts`, `prisma.config.ts`,
  `BACKEND_PLAN.md`
- `lib/`: `auth-guards.ts`, `blog.ts`, `prisma.ts`, `users.ts`, `redis.ts`,
  `ratelimit.ts`
- `components/`: `AdminActions`, `BlogPostCard`, `BlogPostForm`,
  `DeleteAllByUserButton`, `DeletePostButton`, `LoginForm`, `StatusBadge`, `StatsRow`
- `data/`: `blog.json`, `users.json`
- `public/openapi.yaml`
- `__tests__/`: `api/posts.test.ts`, `api/posts-status.test.ts`,
  `api/register.test.ts`, `components/BlogPostForm.test.tsx`, `lib/blog.test.ts`,
  `lib/projects.test.ts` (Prisma-coupled), `seed/add-project.test.ts` (CRUD-coupled)

### Edit (prune couplings)

- **`app/page.tsx`** — remove `getPublishedPosts`/`BlogPostCard` imports, the blog
  `<section>`, and the "Write a post" button. Home reads `getAllProjects()` directly.
- **`app/providers.tsx`** — drop next-auth `SessionProvider`. If nothing else needs a
  provider, delete the file and render children directly in `layout.tsx`.
- **`components/Header.tsx`** — remove `useSession`/`signOut`, the sign-in button, the
  user dropdown, and dashboard/admin links. Remove the "Blog" nav link. Keep About /
  Skills / Projects / Experience / Contact.
- **`package.json`** — drop deps: `@prisma/client`, `@prisma/adapter-pg`, `prisma`,
  `next-auth`, `bcryptjs`, `@types/bcryptjs`, `@upstash/ratelimit`, `@upstash/redis`,
  `@neondatabase/serverless`, `swagger-ui-dist`, `swagger-ui-react`,
  `@types/swagger-ui-react`, `tsx`, `ts-node`. Remove `prisma generate` from the
  `build` script and remove the `seed` script. Keep `resend`, `embla-carousel-react`,
  `@vercel/analytics`, `@vercel/speed-insights`, jest/testing-library devdeps.
- **`.env.example`** — keep only `RESEND_API_KEY` and `CONTACT_EMAIL`.
- **`.github/workflows/ci.yaml`** — copy as-is except remove the `npx prisma generate`
  step from the `typecheck` job (keep `npx next typegen` + `npx tsc --noEmit`).

### Keep as-is

- Home content (hero/about/skills/projects/experience/contact)
- `ProjectCard`, `ProjectModal`, `Button`, `SkillsSection`, `ContactForm`,
  `ContactLinks`, `RevealInit`
- `lib/format.ts`, `lib/contact.tsx`
- `__tests__/components/ContactForm.test.tsx` (only surviving test)
- `app/globals.css`, `app/layout.tsx` (keeps Analytics + SpeedInsights), `app/icon.svg`
- `next.config.ts` (picsum remote patterns), `tsconfig.json`, `eslint.config.mjs`,
  `postcss.config.mjs`, `jest.config.ts`, `jest.setup.ts`, `.nvmrc`,
  `AGENTS.md`, `CLAUDE.md`, `DESIGN_SYSTEM.md`
- `public/Profile.jpg`, `public/ProfileHover.jpg`
- `data/projects.json`, `data/skills.json`

## CI / workflow

Jobs: `test` (jest), `lint` (eslint), `typecheck` (`next typegen` + `tsc --noEmit`,
**no** prisma generate), `audit` (`npm audit --audit-level=high`). Triggers on
`pull_request` and `push` to `master`. The workflow file ships in the first push so
branch protection (configured by the user on GitHub) has a status check to gate on.

## Branching

Work lands on a feature branch, opened as a PR into `master` — not pushed directly to
`master`. First push includes the CI workflow.

## Verification

- `npm ci` clean install with pruned deps.
- `npm run build` succeeds (no Prisma, no missing imports).
- `npm test` passes (ContactForm spec).
- `npx tsc --noEmit` clean.
- `npm run dev` — home renders all sections; project modal works; contact form submits
  (with valid Resend env) or surfaces the existing error path.
- `grep` confirms no remaining references to `prisma`, `next-auth`, `@upstash`, `blog`,
  `auth`, `swagger` in shipped source.
