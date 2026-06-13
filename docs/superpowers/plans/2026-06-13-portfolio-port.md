# Portfolio Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the portfolio-relevant parts of the over-built Next.js school project into the empty Portfolio repo, JSON-backed, stripped of blog/auth/database/redis/swagger/self-facing API routes.

**Architecture:** Approach A — copy the whole source tree into Portfolio, then delete unwanted files, rewrite two files (`lib/projects.ts`, `app/api/contact/route.ts`), prune `package.json`, fix CI. Idiomatic App Router data flow: Server Component (`app/page.tsx`) reads the repository module (`lib/projects.ts`) directly from JSON — no internal API route. The only Route Handler is the contact form (a client mutation that sends mail via Resend).

**Tech Stack:** Next.js 16, React 19, TypeScript, Resend, embla-carousel, Vercel Analytics/Speed Insights, Jest + Testing Library.

**Source:** `/Users/jaridijk/RiderProjects/Next.js`
**Target:** `/Users/jaridijk/RiderProjects/Portfolio`

**Conventions:** All work happens in the Portfolio repo on a feature branch. Commit after each task. Do NOT push to `master` — final step opens a PR. Run all commands from the Portfolio repo root unless stated otherwise.

---

### Task 1: Create feature branch and import the source tree

**Files:**
- Create: entire Portfolio working tree (copied from source, minus build/vcs artifacts)

- [ ] **Step 1: Create the feature branch in Portfolio**

```bash
cd /Users/jaridijk/RiderProjects/Portfolio
git checkout -b port-from-nextjs
```

- [ ] **Step 2: Copy the source tree, excluding artifacts and machine-local files**

`rsync` with excludes keeps Portfolio's own `.git`, `.idea`, and `.gitignore` intact. We exclude `node_modules`/`.next`/`.swc`/lockfile/tsbuildinfo (regenerated later) and env files (machine-local secrets).

```bash
rsync -a \
  --exclude='.git/' \
  --exclude='.idea/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.swc/' \
  --exclude='*.tsbuildinfo' \
  --exclude='package-lock.json' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.gitignore' \
  /Users/jaridijk/RiderProjects/Next.js/ /Users/jaridijk/RiderProjects/Portfolio/
```

- [ ] **Step 3: Verify the copy landed**

```bash
ls app components lib data .github/workflows
```
Expected: directories exist, including `app/`, `components/`, `lib/`, `data/`, `.github/workflows/ci.yaml`.

- [ ] **Step 4: Commit the raw import**

```bash
git add -A
git commit -m "chore: import source tree from Next.js project"
```

---

### Task 2: Delete blog / auth / database / swagger files

**Files:**
- Delete: dirs and files listed below

- [ ] **Step 1: Delete unwanted directories**

```bash
cd /Users/jaridijk/RiderProjects/Portfolio
rm -rf \
  app/admin app/blog app/dashboard app/login app/docs \
  app/api/admin app/api/auth app/api/blog app/api/projects \
  prisma
```

- [ ] **Step 2: Delete unwanted root + lib + component + data + test files**

```bash
rm -f \
  auth.ts auth.config.ts proxy.ts prisma.config.ts BACKEND_PLAN.md \
  lib/auth-guards.ts lib/blog.ts lib/prisma.ts lib/users.ts lib/redis.ts lib/ratelimit.ts \
  components/AdminActions.tsx components/BlogPostCard.tsx components/BlogPostForm.tsx \
  components/DeleteAllByUserButton.tsx components/DeletePostButton.tsx \
  components/LoginForm.tsx components/StatusBadge.tsx components/StatsRow.tsx \
  data/blog.json data/users.json \
  public/openapi.yaml \
  types/next-auth.d.ts \
  docs/superpowers/plans/2026-05-22-backend-migration.md \
  __tests__/api/posts.test.ts __tests__/api/posts-status.test.ts __tests__/api/register.test.ts \
  __tests__/components/BlogPostForm.test.tsx __tests__/lib/blog.test.ts \
  __tests__/lib/projects.test.ts __tests__/seed/add-project.test.ts
```

`types/` then contains only the deleted next-auth augmentation — remove the empty dir:

```bash
rmdir types 2>/dev/null; true
```

- [ ] **Step 3: Remove now-empty test directories**

```bash
rmdir __tests__/api __tests__/seed 2>/dev/null; true
```

- [ ] **Step 4: Verify the kept files remain**

```bash
ls lib components data __tests__/components app/api/contact
```
Expected: `lib/` has `contact.tsx format.ts projects.ts`; `components/` has `Button.tsx ContactForm.tsx ContactLinks.tsx Header.tsx ProjectCard.tsx ProjectModal.tsx RevealInit.tsx SkillsSection.tsx`; `data/` has `projects.json skills.json`; `__tests__/components/` has `ContactForm.test.tsx`; `app/api/contact/route.ts` exists.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: strip blog, auth, database, and swagger files"
```

---

### Task 3: Rewrite `lib/projects.ts` as a JSON-backed repository

**Files:**
- Modify (full rewrite): `lib/projects.ts`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `lib/projects.ts` with:

```ts
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
```

- [ ] **Step 2: Verify no kept file imports a removed export**

The old file exported `ProjectInput`, `getProjectById`, `createProject`, `updateProject`, `deleteProject`. Confirm nothing still imports them:

```bash
grep -rn "ProjectInput\|getProjectById\|createProject\|updateProject\|deleteProject" app components lib __tests__
```
Expected: no output. (If any appears, it is in a file that should have been deleted in Task 2 — recheck.)

- [ ] **Step 3: Verify the JSON satisfies the type**

```bash
npx tsc --noEmit lib/projects.ts 2>&1 | head -20 || true
```
Expected: no errors referencing `lib/projects.ts`. (Standalone `tsc` may warn about JSON resolution flags; the authoritative check is the full typecheck in Task 10. If you see `Cannot find module '@/data/projects.json'`, that is the path-alias not being applied standalone — ignore here, Task 10 covers it.)

- [ ] **Step 4: Commit**

```bash
git add lib/projects.ts
git commit -m "refactor: back projects with JSON instead of Prisma"
```

---

### Task 4: Rewrite `app/api/contact/route.ts` (Resend only)

**Files:**
- Modify (full rewrite): `app/api/contact/route.ts`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `app/api/contact/route.ts` with (drops the Prisma persist; a send failure is now a real 500 rather than a saved-but-not-sent success):

```ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify no Prisma reference remains in the route**

```bash
grep -n "prisma" app/api/contact/route.ts
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/api/contact/route.ts
git commit -m "refactor: contact route sends via Resend only, drop Prisma"
```

---

### Task 5: Remove the blog section from the home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove the blog imports**

In `app/page.tsx`, delete these two import lines:

```ts
import { getPublishedPosts } from "@/lib/blog";
```
```ts
import BlogPostCard from "@/components/BlogPostCard";
```

- [ ] **Step 2: Replace the data fetch**

Replace this block:

```ts
  const [projects, publishedPosts] = await Promise.all([
    getAllProjects(),
    getPublishedPosts(),
  ]);
```

with:

```ts
  const projects = await getAllProjects();
```

- [ ] **Step 3: Delete the entire blog `<section>`**

Remove the whole block from the `{/* ── BLOG ── */}` comment through its closing `</section>` (the section with `id="blog"`, the "Write a post" button, and the `publishedPosts.map(...)` grid). The `{/* ── EXPERIENCE ── */}` section stays above it and `{/* ── CONTACT ── */}` stays below it.

- [ ] **Step 4: Verify no blog references remain**

```bash
grep -n "publishedPosts\|BlogPostCard\|getPublishedPosts\|/blog" app/page.tsx
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: remove blog section from home page"
```

---

### Task 6: Strip auth UI and the Blog link from the Header

**Files:**
- Modify: `components/Header.tsx`

- [ ] **Step 1: Remove the next-auth import**

Delete this line:

```ts
import { useSession, signOut } from "next-auth/react";
```

- [ ] **Step 2: Remove the Blog nav link**

In the `navLinks` array, delete this entry:

```ts
  { label: "Blog", href: "/#blog" },
```

- [ ] **Step 3: Remove the session hook**

Inside the `Header` component, delete:

```ts
  const { data: session } = useSession();
```
and delete the dropdown state + its outside-click effect:

```ts
  const [dropdownOpen, setDropdownOpen] = useState(false);
```
```ts
  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropdownOpen]);
```

- [ ] **Step 4: Replace the right-side auth block, keep the mobile toggle**

Replace the entire right-side container — the `<div style={{ display: "flex", alignItems: "center", gap: 16 }}>` that wraps both the `session?.user ? (...) : (...)` ternary AND the mobile toggle button — with a version that keeps only the mobile toggle:

```tsx
        {/* Right side: mobile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Mobile toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open menu"
            style={{
              display: "none",
              flexDirection: "column", justifyContent: "center",
              gap: 5, width: 40, height: 40,
              background: "none", border: "none", cursor: "pointer", padding: 4,
            }}
          >
            <span style={{ display: "block", height: 2, background: "var(--color-text)", borderRadius: 2, transition: "transform 0.2s, opacity 0.2s", transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", height: 2, background: "var(--color-text)", borderRadius: 2, transition: "opacity 0.2s", opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ display: "block", height: 2, background: "var(--color-text)", borderRadius: 2, transition: "transform 0.2s", transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
```

- [ ] **Step 5: Verify no auth/blog references remain**

```bash
grep -n "session\|signOut\|useSession\|dropdownOpen\|/login\|/dashboard\|/admin\|Blog" components/Header.tsx
```
Expected: no output.

- [ ] **Step 6: Confirm `Link` is still used**

```bash
grep -n "next/link\|<Link" components/Header.tsx
```
Expected: the `import Link from "next/link"` and the logo `<Link href="/">` remain (so the import is not now unused). If the logo no longer uses `Link`, remove the import.

- [ ] **Step 7: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: remove auth UI and blog link from header"
```

---

### Task 7: Remove the next-auth SessionProvider

**Files:**
- Delete: `app/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Delete the providers file**

```bash
cd /Users/jaridijk/RiderProjects/Portfolio
rm -f app/providers.tsx
```

- [ ] **Step 2: Remove the Providers import from layout**

In `app/layout.tsx`, delete:

```ts
import Providers from "./providers";
```

- [ ] **Step 3: Render children directly (unwrap Providers)**

Replace the `<body>` contents:

```tsx
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
```

with:

```tsx
      <body suppressHydrationWarning>
        <Header />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
```

- [ ] **Step 4: Verify**

```bash
grep -rn "next-auth\|Providers\|SessionProvider" app
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: drop next-auth SessionProvider from layout"
```

---

### Task 8: Prune dependencies and env example

**Files:**
- Modify (full rewrite): `package.json`
- Modify (full rewrite): `.env.example`

- [ ] **Step 1: Replace `package.json` with the pruned version**

```json
{
  "name": "portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1",
    "embla-carousel-react": "^8.6.0",
    "next": "^16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "resend": "^6.12.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "jest": "^30.3.0",
    "jest-environment-jsdom": "^30.3.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Replace `.env.example`**

```bash
cat > .env.example <<'EOF'
# Resend transactional email (contact form)
RESEND_API_KEY=
# Address contact-form submissions are delivered to
CONTACT_EMAIL=
EOF
```

- [ ] **Step 3: Fresh install to regenerate a clean lockfile**

```bash
rm -rf node_modules package-lock.json
npm install
```
Expected: completes without peer-dependency errors. A clean `package-lock.json` is generated.

- [ ] **Step 4: Verify no removed package is referenced in source**

```bash
grep -rn "next-auth\|@prisma\|'prisma'\|bcryptjs\|@upstash\|@neondatabase\|swagger" app components lib __tests__ next.config.ts
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: prune deps to portfolio-only set"
```

---

### Task 9: Fix the CI workflow (drop Prisma generate)

**Files:**
- Modify: `.github/workflows/ci.yaml`

- [ ] **Step 1: Remove the Prisma step from the typecheck job**

In `.github/workflows/ci.yaml`, delete this single line from the `typecheck` job:

```yaml
      - run: npx prisma generate
```

The `typecheck` job keeps `npx next typegen` and `npx tsc --noEmit`. Leave `test`, `lint`, and `audit` jobs unchanged. Triggers stay `pull_request` and `push` on `master`.

- [ ] **Step 2: Verify**

```bash
grep -n "prisma" .github/workflows/ci.yaml
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yaml
git commit -m "ci: drop prisma generate from typecheck job"
```

---

### Task 10: Full verification and PR

**Files:** none (verification only)

- [ ] **Step 1: Typecheck (mirrors CI)**

```bash
cd /Users/jaridijk/RiderProjects/Portfolio
npx next typegen && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors. (If an unused-import error surfaces in `Header.tsx` or `layout.tsx`, remove the offending import and re-run.)

- [ ] **Step 3: Tests**

```bash
npm test
```
Expected: PASS — `__tests__/components/ContactForm.test.tsx`, 5 tests passing.

- [ ] **Step 4: Production build**

```bash
npm run build
```
Expected: build succeeds. The home page renders; `app/api/contact` compiles as a route handler. No errors about missing modules (`@/lib/blog`, `@/lib/prisma`, `next-auth`, etc.).

- [ ] **Step 5: Manual smoke test**

```bash
npm run dev
```
Visit `http://localhost:3000`. Confirm: hero, about, skills, projects (cards render, modal opens, carousel + prev/next work), experience, contact form render. No "Sign in" button, no Blog nav link or section. Stop the dev server when done.

- [ ] **Step 6: Final sweep for stragglers**

```bash
grep -rn "prisma\|next-auth\|@upstash\|getPublishedPosts\|BlogPostCard\|openapi\|swagger" app components lib __tests__ 2>/dev/null
```
Expected: no output.

- [ ] **Step 7: Push the branch and open the PR**

```bash
git push -u origin port-from-nextjs
gh pr create --base master --head port-from-nextjs \
  --title "Port portfolio from Next.js school project" \
  --body "JSON-backed portfolio stripped of blog, auth, database, redis, and swagger. Ships CI workflow. See docs/superpowers/specs/2026-06-13-portfolio-port-design.md."
```
Expected: PR created; CI runs the four jobs against it. The user configures branch protection on GitHub.

---

## Notes

- The contact form requires `RESEND_API_KEY` and `CONTACT_EMAIL` set locally (`.env.local`) to actually send mail; without them the form's validation still works and submission surfaces the error path. CI does not exercise mail sending.
- `next.config.ts` keeps the picsum remote image patterns (projects use picsum placeholders for now).
