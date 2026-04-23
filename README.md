# motorrad.news

Motorrad-Nachrichtenportal mit redaktionellem CMS, Event-Kalender und Händlerverzeichnis. Gebaut mit **Next.js 16**, **React 19**, **Drizzle ORM** und **Neon Postgres**. Deployed auf **Vercel**.

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS 4 |
| Datenbank | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 (Credentials) |
| Bild-Upload | Vercel Blob Storage |
| Rich-Text-Editor | Tiptap |
| KI-Unterstützung | Anthropic Claude (Artikel-Aufbereitung) |
| Icons | Lucide React |
| Deployment | Vercel |

## Projektstruktur

```
src/
├── app/
│   ├── (public)/           # Öffentliche Seiten (Startseite, Kategorien, Termine, Suche …)
│   ├── admin/              # Geschützter Admin-Bereich (Dashboard, Artikel, Events, Händler …)
│   ├── api/                # API-Routes (CRUD, Cron-Jobs, Upload, Auth)
│   ├── feed.xml/           # RSS-Feed
│   ├── sitemap.ts          # Dynamische Sitemap
│   └── layout.tsx          # Root-Layout mit globalen Meta-Daten
├── components/
│   ├── admin/              # Admin-UI-Komponenten (Editor, Tabellen, Modals)
│   └── public/             # Öffentliche Komponenten (ArticleGrid, EventList, CategoryNav …)
├── db/
│   ├── schema.ts           # Drizzle-Tabellendefinitionen
│   ├── index.ts            # DB-Client
│   └── seed.ts             # Seed-Skript mit Beispieldaten
└── lib/                    # Hilfsfunktionen (Auth, Crawler, SEO-Konfiguration …)
drizzle/                    # SQL-Migrationsdateien
```

## Voraussetzungen

- **Node.js** ≥ 18
- **npm** (oder pnpm/yarn)
- **Neon-Datenbank** (oder eine andere PostgreSQL-Instanz)
- **Vercel-Konto** (für Blob Storage und Deployment)

## Installation

```bash
git clone https://github.com/contentking-de/motorradnews.git
cd motorradnews
npm install
```

## Umgebungsvariablen

Erstelle eine Datei `.env.local` im Projektroot mit folgenden Variablen:

```env
# PostgreSQL-Verbindung (Neon Serverless)
DATABASE_URL=""

# NextAuth – Session-Secret und Basis-URL
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob Storage – Read/Write-Token
BLOB_READ_WRITE_TOKEN=""

# Anthropic API – für KI-gestützte Artikelaufbereitung
ANTHROPIC_API_KEY=""

# Cron-Secret – Absicherung der Cron-API-Routes
CRON_SECRET=""

# Google Indexing API – für automatische Index-Benachrichtigungen (optional)
GOOGLE_INDEXING_CLIENT_EMAIL=""
GOOGLE_INDEXING_PRIVATE_KEY=""
```

| Variable | Beschreibung | Erforderlich |
|----------|-------------|:------------:|
| `DATABASE_URL` | PostgreSQL-Connection-String (Neon mit `?sslmode=require`) | Ja |
| `NEXTAUTH_SECRET` | Zufälliger String für Session-Verschlüsselung | Ja |
| `NEXTAUTH_URL` | Basis-URL der App (`http://localhost:3000` lokal) | Ja |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage Token für Bild-Uploads | Ja |
| `ANTHROPIC_API_KEY` | Anthropic API-Key für Claude-Integration | Ja |
| `CRON_SECRET` | Shared Secret für `/api/cron/*`-Endpunkte | Ja |
| `GOOGLE_INDEXING_CLIENT_EMAIL` | Service-Account-E-Mail für Google Indexing API | Nein |
| `GOOGLE_INDEXING_PRIVATE_KEY` | Privater Schlüssel des Service-Accounts (PEM) | Nein |

## Datenbank einrichten

```bash
# Migrationen ausführen
npx drizzle-kit push

# Optional: Beispieldaten laden
npx tsx src/db/seed.ts
```

Schema-Änderungen generieren:

```bash
npx drizzle-kit generate
```

## Development

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

### Admin-Bereich

Der Admin-Bereich ist unter `/admin` erreichbar und durch NextAuth (Credentials-Provider) geschützt. Benutzer werden in der `users`-Tabelle verwaltet (Rollen: `ADMIN`, `EDITOR`).

## Build & Deployment

```bash
npm run build
npm start
```

Das Projekt ist für **Vercel** optimiert. Beim Push auf `main` wird automatisch deployed. Alle Umgebungsvariablen müssen in den Vercel-Projekteinstellungen hinterlegt sein.

## Linting

```bash
npm run lint
```
