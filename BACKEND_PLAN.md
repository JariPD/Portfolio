# BACKEND_PLAN.md — Portfolio Jari Dijk
## Database Migratie: JSON → PostgreSQL (Prisma)

---

## 2a. Huidige staat

### API-routes en hun JSON-gebruik

| Route | Methode | Beschrijving | JSON-bestand |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler | Delegeert aan auth.ts |
| `/api/auth/register` | POST | Gebruiker registreren | data/users.json (lezen + schrijven) |
| `/api/blog/posts` | POST | Nieuw blogbericht aanmaken | data/blog.json (lezen + schrijven) |
| `/api/blog/posts/[id]` | DELETE | Blogbericht verwijderen | data/blog.json (lezen + schrijven) |
| `/api/blog/posts/[id]/status` | PATCH | Status bijwerken (admin) | data/blog.json (lezen + schrijven) |
| `/api/contact` | POST | Contactformulier verwerken | Geen (Resend API) |

### Lib-functies die JSON lezen

**lib/blog.ts** — synchrone functies via `fs.readFileSync`:
- `getAllPosts()` → leest data/blog.json
- `getPublishedPosts()` → filtert op status "published"
- `getPostBySlug(slug)` → opzoeken op slug
- `getPostById(id: number)` → opzoeken op numeriek id
- `getPostsByAuthor(email)` → filtert op auteur-email
- `appendPost(post)` → schrijft naar data/blog.json
- `updatePostStatus(id: number, status)` → update status in JSON
- `deletePost(id: number)` → verwijdert post uit JSON

**lib/users.ts** — synchrone functies via `fs.readFileSync`:
- `getUserByEmail(email)` → leest data/users.json
- `displayName(email)` → kijkt naam op via getUserByEmail

**lib/projects.ts** — statische import:
- `getAllProjects()` → `import data from "@/data/projects.json"`

### Authenticatie (huidig)

- **Framework:** NextAuth v5.0.0-beta.30
- **Provider:** Credentials (email + wachtwoord)
- **Wachtwoord:** bcryptjs.compare tegen bcrypt-hash in users.json
- **Sessie:** JWT met `role` vanuit JWT-callback (auth.config.ts)
- **Rolcontrole:** auth.ts vergelijkt tegen `data/users.json`

### Gevonden problemen / inconsistenties

1. **`*.md` in .gitignore** — alle Markdown-bestanden worden genegeerd door Git, inclusief dit bestand. De `.gitignore` heeft `*.md` op regel 32. Dit is bewust (Claude Code-sessielogs), maar BACKEND_PLAN.md zal niet worden getrackt.
2. **Register-route schrijft direct naar fs** — niet via lib/users.ts, maar opent users.json rechtstreeks.
3. **Blog-id is een number** — wordt gebruikt als `Number(id)` in API-routes. Na migratie: UUID-string.
4. **`app/page.tsx` is niet async** — roept synchrone lib-functies aan. Na migratie moet dit een async Server Component worden.
5. **`displayName(email)` doet async lookup synchroon** — werkt met JSON maar niet met Prisma. Signature wordt gewijzigd (zie §2f).
6. **`@neondatabase/serverless` al geïnstalleerd** maar niet gebruikt. Kan worden verwijderd (buiten scope).

---

## 2b. Databaseschema (Prisma)

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

---

## 2c. Migratieplan per API-route

### `POST /api/auth/register`

| | Huidig | Nieuw |
|---|---|---|
| Duplicate check | `getUserByEmail(email)` → sync JSON-lookup | `await getUserByEmail(email)` → Prisma findUnique |
| Aanmaken | `fs.writeFileSync` direct op users.json | `await createUser(...)` → Prisma create |
| Hash cost | bcrypt rounds: 10 | bcrypt rounds: 12 |

OWASP: ✅ Input validatie (A03), ✅ bcrypt hash (A02), ✅ 409 bij duplicate (correct)

### `POST /api/blog/posts`

| | Huidig | Nieuw |
|---|---|---|
| ID genereren | `maxId + 1` via getAllPosts() | UUID via Prisma @default(dbgenerated) |
| Opslaan | `appendPost(post)` → schrijft JSON | `await createPost(...)` → Prisma create |

OWASP: ✅ Auth check (A01), ✅ Input validatie (A03)

### `DELETE /api/blog/posts/[id]`

| | Huidig | Nieuw |
|---|---|---|
| ID type | `Number(id)` cast | Geen cast, UUID string direct |
| Opzoeken | `getPostById(Number(id))` → sync | `await getPostById(id)` → Prisma |
| Verwijderen | `deletePost(Number(id))` → sync | `await deletePost(id)` → Prisma |

OWASP: ✅ Auth check (A01), ✅ Owner/admin check (A01), ✅ 404 bij niet gevonden

### `PATCH /api/blog/posts/[id]/status`

| | Huidig | Nieuw |
|---|---|---|
| ID type | `Number(id)` cast | UUID string direct |
| Update | `updatePostStatus(Number(id), status)` → sync | `await updatePostStatus(id, status)` → Prisma |

OWASP: ✅ Admin-only (A01), ✅ Status validatie (A03), ✅ 404 bij niet gevonden

### `POST /api/contact`

| | Huidig | Nieuw |
|---|---|---|
| Opslaan | Niet opgeslagen | Eerst `prisma.contactMessage.create()` |
| Email | Resend API → 500 bij fout | Resend API → waarschuwing bij fout (bericht al opgeslagen) |

OWASP: ✅ Input validatie (A03), ✅ Email-format validatie (A03), ✅ HTML escaping (A03)

---

## 2d. Nieuwe endpoints

### `GET /api/projects`
- Publiek (geen auth)
- Retourneert alle projecten met images, gesorteerd op `sort_order`

### `POST /api/projects`
- Admin only (A01: role check)
- Input: `{ title, description, technologies?, thumbnail_url?, demo_url?, repo_url?, year?, images? }`
- Genereert slug automatisch uit title
- Retourneert 201 + project

### `PUT /api/projects/[id]`
- Admin only
- Partial update (alle velden optioneel)
- Bij `images`: vervangt alle bestaande afbeeldingen (deleteMany + create)
- Retourneert 200 + bijgewerkt project, of 404

### `DELETE /api/projects/[id]`
- Admin only
- Cascade delete: verwijdert ook project_images (via Prisma onDelete: Cascade)
- Retourneert 200, of 404

### `DELETE /api/admin/users/[id]/posts` (F27)
- Admin only
- Verwijdert alle blogberichten van een specifieke gebruiker
- Retourneert `{ success: true, deleted: number }`

---

## 2e. Checklist

### Infrastructuur
- [ ] `npm install prisma @prisma/client`
- [ ] `prisma/schema.prisma` aanmaken
- [ ] `lib/prisma.ts` aanmaken (singleton client)
- [ ] `.env.example` bijwerken
- [ ] `package.json` uitbreiden met `prisma.seed`
- [ ] `.gitignore` controleren: `*.md` op regel 32 blokkeert BACKEND_PLAN.md

### Authenticatie & Users
- [ ] `lib/users.ts` herschrijven (async, Prisma, `createUser` toevoegen)
- [ ] `auth.ts` updaten (await getUserByEmail)
- [ ] `app/api/auth/register/route.ts` herschrijven

### Blog
- [ ] `lib/blog.ts` herschrijven (async, Prisma, `createPost` toevoegen)
- [ ] `app/api/blog/posts/route.ts` updaten
- [ ] `app/api/blog/posts/[id]/route.ts` updaten
- [ ] `app/api/blog/posts/[id]/status/route.ts` updaten

### Pagina's (minimale aanpassingen)
- [ ] `app/page.tsx` — `async` toevoegen + `await` voor lib-aanroepen
- [ ] `app/admin/page.tsx` — `await` voor `getAllPosts()`
- [ ] `app/dashboard/page.tsx` — `await` voor `getPostsByAuthor()`
- [ ] `app/blog/[slug]/page.tsx` — `await` voor lib-aanroepen + `displayName` aanroep updaten

### Projecten
- [ ] `lib/projects.ts` herschrijven (async, Prisma, admin-functies toevoegen)
- [ ] `app/api/projects/route.ts` aanmaken (GET + POST)
- [ ] `app/api/projects/[id]/route.ts` aanmaken (PUT + DELETE)

### Contact
- [ ] `app/api/contact/route.ts` updaten (DB-opslaan vóór Resend)

### Admin
- [ ] `app/api/admin/users/[id]/posts/route.ts` aanmaken (F27)

### Tests
- [ ] `__tests__/lib/blog.test.ts` updaten (Prisma mock ipv fs mock)
- [ ] `__tests__/api/posts.test.ts` updaten (createPost mock)
- [ ] `__tests__/api/posts-status.test.ts` updaten (string ID, async mocks)
- [ ] `__tests__/api/register.test.ts` updaten (createUser mock, geen fs mock)
- [ ] `__tests__/lib/projects.test.ts` updaten (Prisma mock)

### Seed
- [ ] `prisma/seed.ts` aanmaken

---

## 2f. Wijzigingen in TypeScript-types (breaking changes)

### `BlogPost` type

| Veld | Voor | Na | Impact |
|---|---|---|---|
| `id` | `number` | `string` (UUID) | API-routes passen Number() cast aan; URL-gebruik werkt ongewijzigd |
| `authorName` | — | `string` (nieuw) | blog/[slug]/page.tsx: `displayName(post.author, post.authorName)` |

### `User` type

| Veld | Voor | Na |
|---|---|---|
| `id` | `number` | `string` (UUID) |

### `displayName` signatuur

```typescript
// Voor
displayName(email: string): string  // deed async lookup in JSON
// Na
displayName(email: string, name?: string): string  // puur, geen I/O
```

Aanroepen in `app/blog/[slug]/page.tsx`:
```typescript
// Voor
const name = displayName(post.author)
// Na
const name = displayName(post.author, post.authorName)
```

### `Project` type

Veldnamen blijven gelijk voor component-compatibiliteit (`shortDescription`, `tech`, `thumbnail`, `images`, `demoUrl`, `githubUrl`). De lib-functie mapt intern vanuit Prisma-veldnamen naar deze oude namen.

Velden die verdwijnen uit de return waarde:
- `color` — niet in DB-schema (components die `project.color` gebruiken krijgen `undefined`)
- `month` — niet in DB-schema (components die `project.month` gebruiken krijgen `undefined`)

---

## 2g. Wat de developer zelf doet (buiten scope implementatie)

1. Neon-database aanmaken en `DATABASE_URL` instellen in `.env` en Vercel
2. `npx prisma migrate dev --name init` uitvoeren
3. `npx prisma db seed` uitvoeren
4. GitHub Actions secrets instellen
5. Vercel environment variables instellen
