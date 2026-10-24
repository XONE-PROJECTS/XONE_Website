# Xone Software Development — Next.js Site

Greenfield **Next.js App Router** rebuild of the Xone marketing site. Single app deployed on **Vercel**; no separate Express backend.

**Spec:** [`PROJECT_INFO_NEXT.md`](./PROJECT_INFO_NEXT.md) · **Sprint plan:** [`SPRINT_PLAN_v1.md`](./SPRINT_PLAN_v1.md) · **Deploy:** [`DEPLOY.md`](./DEPLOY.md)

**v1 lead capture:** **View Our Projects** (`/projects`) + **email-only** contact (`mailto:xonesoftware.marketing@gmail.com`). Online forms deferred to v1.1.

**Status:** **v1 shipped** on Vercel (June 2026).

## Prerequisites

- **Node.js 22.x** (matches Vercel and CI)
- npm 10+

## Quick start

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

`npm install` also activates the Husky Git hooks. Before a commit, lint-staged
auto-fixes ESLint issues and formats only staged files. Before a push, the full
lint and formatting checks must pass.

Open [http://localhost:5142](http://localhost:5142).

Optional local env for SEO preview:

```env
SITE_URL=http://localhost:5142
```

## Scripts

| Command                    | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `npm run dev`              | Next.js dev server with Turbopack on **port 5142** |
| `npm run build`            | Production build                                   |
| `npm run start`            | Production server on port 5142                     |
| `npm run lint`             | ESLint (Next.js + TypeScript)                      |
| `npm run test`             | Unit tests + full Playwright E2E suite             |
| `npm run test:unit`        | Vitest unit tests (`tests/*.test.ts`)              |
| `npm run test:e2e`         | Playwright E2E (all projects)                      |
| `npm run test:e2e:mobile`  | Mobile/tablet E2E projects only                    |
| `npm run test:e2e:desktop` | Desktop structural layout guard only               |

## Environment variables

Server-only — **never** prefix secrets with `NEXT_PUBLIC_`.

| Variable                              | Required                  | Description                                   |
| ------------------------------------- | ------------------------- | --------------------------------------------- |
| `SITE_URL`                            | Recommended in production | Canonical URL for sitemap, robots, Open Graph |
| `RATE_LIMIT_*`, `CONTACT_WEBHOOK_URL` | v1.1 only                 | Form APIs — not used in v1                    |

See [`.env.example`](./.env.example). Production values go in the **Vercel dashboard** only.

## Key routes

| Route                             | Purpose                          |
| --------------------------------- | -------------------------------- |
| `/`                               | Homepage (6 sections)            |
| `/projects`                       | Portfolio showcase + email CTAs  |
| `/contact`                        | Email, phone, location (no form) |
| `/services`, `/about`, `/process` | Marketing pages                  |
| `/privacy`, `/terms`              | Legal pages                      |
| `/get-started`                    | Redirects to `/projects`         |
| `/robots.txt`, `/sitemap.xml`     | SEO (Next metadata routes)       |

## Project structure

```text
app/                 # App Router pages, robots.ts, sitemap.ts
src/
  components/        # Shared UI (navbar, footer, shadcn/ui)
  features/          # home, contact, projects, legal, …
  lib/               # brand, site, metadata, env, utils
public/assets/XONE/  # Brand kit (SVG logos)
tests/               # Vitest tests
```

## API

| Endpoint           | Method | Status              |
| ------------------ | ------ | ------------------- |
| `/api/health`      | GET    | Deploy smoke check  |
| `/api/contact`     | POST   | **v1.1** — deferred |
| `/api/get-started` | POST   | **v1.1** — deferred |

## Testing

### Unit tests

```bash
npm run test:unit
```

Vitest specs live in `tests/`.

### E2E tests (Playwright)

**Prerequisite:** install the Chromium browser once:

```bash
npx playwright install chromium
```

Run mobile/tablet specs first, then desktop guard, then the full matrix:

```bash
npm run build
npm run test:e2e:mobile
npm run test:e2e:desktop
npm run test:e2e
```

Homepage E2E tests click through the full preflight intro (~15s wait) — there is no env bypass.

The desktop guard uses **structural assertions only** (nav visibility, grid columns, overflow, typography thresholds) — no screenshot baselines.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR: lint → format check → unit tests → build → Playwright E2E.

## Deployment (Vercel)

**Status:** v1 is live on Vercel. See [`DEPLOY.md`](./DEPLOY.md) for setup reference and the post-deploy checklist (completed for initial ship).

Quick summary for new environments:

1. Push to `main` with CI green
2. Import repo in Vercel (root = `.`, Node 22.x)
3. Set **`SITE_URL`** to your production domain
4. Run the post-deploy checklist in `DEPLOY.md`
5. PM + Tech Lead sign-off per `PROJECT_INFO_NEXT.md` §17

## Source reference

Behavior and assets are ported from **`xone-swe-web`** (Vite + Express). That repo is read-only reference.
