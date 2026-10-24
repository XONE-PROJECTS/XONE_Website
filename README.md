# Xone Software Development — Next.js Site

Greenfield **Next.js App Router** rebuild of the Xone marketing site. Single app deployed on **Vercel**; no separate Express backend.

**Spec:** [`PROJECT_INFO_NEXT.md`](./PROJECT_INFO_NEXT.md) · **Sprint plan:** [`SPRINT_PLAN_v1.md`](./SPRINT_PLAN_v1.md) · **Deploy:** [`DEPLOY.md`](./DEPLOY.md)

**v1 lead capture:** **View Our Projects** (`/projects`) + **email-only** contact (`mailto:xonesoftware.marketing@gmail.com`). Online forms deferred to v1.1.

**Status:** **v1 shipped** on Vercel (June 2026).

## Services project estimator

On `/services`, **Start a project** opens a searchable estimator for websites,
business systems, wedding/event solutions, apps, and design. Customers can select
multiple systems, scoped add-ons, a yearly domain, and independent hosting and
maintenance terms of 1, 3, 6, or 12 months. Local/on-premise installation is a
one-time setup on the customer's own PC/server; web hosting is monthly.

**Learners Module System (LMS)** includes learning modules, enrollment,
assessments, and progress tracking, with an editable sample estimate of ₱60,000.

Prices are illustrative PHP estimates, not binding quotations. **Others / Custom
system** requires a description and stays marked **Custom quote required** alongside
the priced subtotal. Hardware, subscriptions, payment fees, and usage charges need
separate confirmation.

In the existing admin CMS, open the **Pricing** panel to edit labels, descriptions,
availability, and PHP prices. Use **Save draft** and preview Services before
**Publish**. Pricing participates in undo/redo and revision restoration. Existing
content receives catalog defaults without replacing pages or changing the content
version. Billing units and add-on eligibility remain fixed.

**Copy estimate** copies the complete breakdown. **Email project inquiry** validates
the brief and opens an email draft; it does not send or store a lead. Details stay
in page memory and reset when the page reloads. Clipboard-denied browsers provide
a selectable-text fallback. No public submission API is introduced.

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

Browser tests use port **5142** by default. Set `PLAYWRIGHT_PORT` to an unused
port when a development server is already running. Estimator browser checks run
on the desktop profile as well as all mobile/tablet profiles.

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
