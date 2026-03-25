# motorrad.news – Full-Stack News CMS

## Project Overview

Build a modern motorcycle news platform called **motorrad.news** — a full-featured CMS with a public-facing news site and a password-protected admin/editorial backend.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Neon PostgreSQL (serverless) via `@neondatabase/serverless`
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5 (credentials provider, role-based: ADMIN, EDITOR)
- **Rich Text Editor**: Tiptap (for article body)
- **Image Uploads**: Uploadthing or Cloudinary
- **Slug generation**: slugify
- **Date formatting**: date-fns
- **Icons**: Lucide React

---

## Design Direction

Light, editorial, modern — inspired by high-quality motorcycle magazines like *Motorrad* and *Cycle World*.

- **Color palette**: White background (`#FFFFFF`), near-black text (`#111111`), vivid red accent (`#E31E24`) — the "motorsport red"
- **Typography**: Use `next/font` to load:
  - Display/headings: `Barlow Condensed` (bold, sporty)
  - Body: `Source Serif 4` (readable, editorial)
- **Layout**: Clean grid with a strong header featuring the logo, a sticky top navigation with categories, and a hero section for the featured article.
- **Card design**: Article cards with image, category badge, title, teaser, author avatar, and date. Subtle hover lift effect.
- **No generic purple gradients. No Inter. No Roboto.**

---

## Database Schema (Drizzle ORM + Neon)

Create the following tables in `src/db/schema.ts`:

```typescript
// users
id (uuid, pk)
name (varchar 100)
email (varchar 255, unique)
passwordHash (text)
role (enum: 'ADMIN' | 'EDITOR')
avatarUrl (text, nullable)
createdAt (timestamp)

// categories
id (uuid, pk)
name (varchar 100)
slug (varchar 100, unique)
description (text, nullable)
sortOrder (int, default 0)
createdAt (timestamp)

// articles
id (uuid, pk)
title (varchar 255)
slug (varchar 255, unique)
teaser (text) // short summary ~160 chars
body (text)   // Tiptap JSON stringified
coverImageUrl (text)
categoryId (uuid, FK → categories)
authorId (uuid, FK → users)
status (enum: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
publishedAt (timestamp, nullable)
createdAt (timestamp)
updatedAt (timestamp)

// tags (optional, many-to-many via article_tags join table)
id (uuid, pk)
name (varchar 50)
slug (varchar 50, unique)
```

Create a `src/db/index.ts` that exports a connected Neon client using `@neondatabase/serverless` and wraps it with Drizzle.

---

## Project Structure

```
motorrad-news/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public news site
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── [category]/
│   │   │   │   └── page.tsx       # Category listing
│   │   │   ├── artikel/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Article detail
│   │   │   └── layout.tsx         # Public layout (header, footer)
│   │   ├── (admin)/               # Protected CMS area
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Stats overview
│   │   │   ├── artikel/
│   │   │   │   ├── page.tsx       # Article list with filters
│   │   │   │   ├── neu/
│   │   │   │   │   └── page.tsx   # New article
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Edit article
│   │   │   ├── kategorien/
│   │   │   │   └── page.tsx       # Category management
│   │   │   ├── redakteure/
│   │   │   │   └── page.tsx       # User management (ADMIN only)
│   │   │   └── layout.tsx         # Admin layout (sidebar, topbar)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── articles/route.ts
│   │   │   ├── articles/[id]/route.ts
│   │   │   ├── categories/route.ts
│   │   │   └── upload/route.ts
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleGrid.tsx
│   │   │   ├── HeroArticle.tsx
│   │   │   ├── CategoryNav.tsx
│   │   │   └── ArticleBody.tsx    # Renders Tiptap JSON to HTML
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── ArticleEditor.tsx  # Tiptap-based rich text editor
│   │   │   ├── ArticleForm.tsx    # Full form (title, slug, category, status, image, body)
│   │   │   ├── ArticleTable.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   └── ImageUploader.tsx
│   │   └── ui/                    # Shared primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       └── Spinner.tsx
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── migrate.ts
│   ├── lib/
│   │   ├── auth.ts               # NextAuth config
│   │   ├── utils.ts              # slugify, formatDate, truncate
│   │   └── validations.ts        # Zod schemas
│   └── middleware.ts             # Route protection
├── drizzle.config.ts
├── .env.local                    # DATABASE_URL, NEXTAUTH_SECRET, etc.
└── tailwind.config.ts
```

---

## Authentication & Authorization

Use **NextAuth.js v5** with the Credentials provider.

- On login, look up user by email, compare bcrypt hash
- Session includes: `id`, `name`, `email`, `role`, `avatarUrl`
- Roles:
  - `ADMIN`: full access (articles, categories, users)
  - `EDITOR`: create/edit own articles only; cannot manage users or categories

Protect all `/dashboard/*` routes in `middleware.ts` using `auth()` from NextAuth. Redirect unauthenticated users to `/login`.

In the admin layout, show/hide navigation items based on session role.

---

## Public Site – Key Pages

### Homepage (`/`)

- Hero: Featured article (latest published) — full-width image, large title, teaser
- Below hero: 3-column article grid, newest first
- Sidebar (optional): category list with article counts
- Load more / pagination

### Category Page (`/[category]`)

- Filtered article grid for that category
- Category title + description at top

### Article Detail (`/artikel/[slug]`)

- Full article with Tiptap-rendered body
- Author info (name, avatar)
- Published date
- Related articles (same category, 3 cards)
- Breadcrumb: Home > Category > Article Title

---

## Admin CMS – Key Features

### Article Editor

- Fields: Title (auto-generates slug), Teaser, Category (dropdown), Status (Draft/Published), Cover Image Upload, Body (Tiptap rich text)
- Tiptap toolbar: Bold, Italic, Underline, Headings (H2/H3), Bullet List, Ordered List, Blockquote, Link, Image embed
- Save as Draft / Publish buttons
- Auto-save hint every 30 seconds (localStorage backup)
- Slug field is editable but auto-generated from title on first input

### Article List

- Table with: Title, Category, Status badge (color-coded), Author, Published date, Actions (Edit, Archive, Delete)
- Filters: by Status, by Category
- Search: by title (client-side or server-side)

### Category Manager

- List all categories with drag-to-reorder (sortOrder)
- Inline edit: name, slug (auto-generated), description
- Create new / delete (with confirmation if articles exist)

### User Management (ADMIN only)

- List users with role badge
- Invite new user (email + role, generates temp password)
- Edit role
- Deactivate (soft delete / isActive flag)

### Dashboard

- Stats cards: Total articles, Published, Drafts, Total categories, Total editors
- Recent articles table (last 10)

---

## API Routes

All under `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/articles` | List articles (with filters) |
| `POST` | `/api/articles` | Create article |
| `GET` | `/api/articles/[id]` | Get single article |
| `PUT` | `/api/articles/[id]` | Update article |
| `DELETE` | `/api/articles/[id]` | Delete article |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/[id]` | Update category |
| `DELETE` | `/api/categories/[id]` | Delete category |
| `GET` | `/api/users` | List users (ADMIN only) |
| `POST` | `/api/upload` | Handle image upload |

All mutating routes must check session and role before proceeding.

---

## Seed Data

Create a `src/db/seed.ts` script that inserts:

- **1 admin user**: `admin@motorrad.news` / password: `m59rockT!richtig`
- **5 categories**: Neuheiten, Tests, Technik, Reisen, Motorsport
- **3 sample articles**: 1 per category, status: `PUBLISHED`

Run with:

```bash
npx tsx src/db/seed.ts
```

---

## Additional Notes

- Use **Server Components** for all public-facing data fetching (SEO + performance)
- Use **Client Components** only for interactive parts (editor, forms, admin tables)
- All slugs must be URL-safe, lowercase, German-umlaut-normalized (`ä→ae`, `ö→oe`, `ü→ue`)
- Dates displayed in German locale (`de-DE`)
- `<title>` and `<meta description>` populated from article title + teaser (Next.js Metadata API)
- Mobile-responsive: hamburger nav on public site, collapsible sidebar in admin
- Error boundaries and loading skeletons on all data-fetching pages

---

## Implementation Order

1. Project setup (Next.js, Tailwind, dependencies)
2. DB schema + Drizzle config + Neon connection
3. NextAuth setup + middleware
4. Admin login page
5. Admin layout (sidebar/topbar)
6. Category CRUD
7. Article editor (form + Tiptap)
8. Article list + filters
9. Public layout (header, footer, fonts)
10. Public homepage + category page + article detail
11. Dashboard stats
12. User management
13. Seed script
14. Polish: loading states, error handling, mobile responsiveness
