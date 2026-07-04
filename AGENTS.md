# AGENTS.md

This file defines the non-negotiable engineering rules for this project. It is intentionally strict and optimized for a **static lead-generation website** built as a **single Next.js app** (App Router) deployed on **Vercel**.

**Product spec:** `PROJECT_INFO_NEXT.md` — read it before structural or API work.  
**Source reference (read-only):** `xone-swe-web` (Vite SPA + Express) — port behavior; do not migrate in-place.

## Core Stack

- **Framework:** Next.js (App Router) with **Turbopack** in dev (`next dev --turbo`)
- **Language:** TypeScript with `strict: true`
- **Styling:** Tailwind CSS v4 + **shadcn/ui**; Xone palette tokens in global CSS and `src/lib/brand.ts`
- **Typography:** Geist Sans (`geist` or `@fontsource-variable/geist`) — do not add Poppins/Inter for new UI
- **UI components:** shadcn/ui (`src/components/ui/`) — add via `npx shadcn@latest add <component>`
- **Routing:** Next.js App Router (`app/**/page.tsx`) — no React Router, no Vite
- **API:** Next.js Route Handlers (`app/api/**/route.ts`) — v1 ships `GET /api/health` only; form POST routes are **v1.1**
- **Lead capture (v1):** Email-only via `mailto:` (`src/lib/brand.ts`) + `/projects` portfolio — no online forms in v1
- **Hosting:** **Vercel only** (repo root = app root)
- **Validation:** Zod at Route Handler boundaries when v1.1 form APIs ship; shared schemas in `src/schemas/`
- **Database:** None in v1
- **Auth:** Not required for public marketing pages; deny-by-default if admin or protected areas are introduced later

**Do not introduce:** Railway, separate backend service, `VITE_*` env vars, GitHub Pages SPA deploy, legacy Technical Documentation CRUD APIs.

## Non-Negotiable Rules

- Never weaken TypeScript strictness to make code compile.
- Never expose secrets, `.env` values, tokens, or database credentials to the browser.
- Only variables explicitly intended for the browser may use the `NEXT_PUBLIC_` prefix; treat all other env vars as server-only secrets.
- Never trust form input, query params, headers, or cookies without validation.
- Never build SQL strings from user input.
- Never bypass authentication or authorization checks for convenience when protected routes exist.
- Never place business logic inside presentational UI components; keep logic in hooks, services, or utilities.
- Never mix DTOs, persistence models, and API response models without explicit mapping.
- Never commit `.env`, `.env.local`, or secret export files.
- Never import server-only modules (env with secrets, Node APIs, DB clients) into Client Components.

## Required Project Structure

Single-app layout at repo root. Use feature-based organization under `src/`. Route files stay thin in `app/`.

```text
xone-swe-next/
  app/
    layout.tsx              # root layout: Navbar, fonts, metadata
    page.tsx                # homepage (/)
    services/page.tsx
    about/page.tsx
    process/page.tsx
    projects/page.tsx
    contact/page.tsx          # email-only in v1
    privacy/page.tsx
    terms/page.tsx
    robots.ts               # optional — metadata API
    sitemap.ts              # optional — metadata API
    api/
      health/route.ts
      # v1.1: contact/route.ts, get-started/route.ts
  src/
    components/
      ui/                   # shadcn/ui primitives
      navbar.tsx
      footer.tsx
    features/
      home/
      services/
      about/
      process/
      projects/
      contact/
    lib/
      brand.ts              # CONTACT_EMAIL, buildContactMailto()
      env.ts                # server env validation (Zod) — v1.1 form vars
      utils.ts
      validation-helpers.ts
    schemas/                # v1.1 — shared Zod when form APIs ship
  public/
    assets/XONE/xone_brand_kit/
  .env.example
  next.config.ts
  package.json
  tsconfig.json
  AGENTS.md
  PROJECT_INFO_NEXT.md
  TEAM_INSTRUCTIONS.md
```

When adding a new page, add `app/<route>/page.tsx` and prefer a `src/features/<name>/` module for components, data, and feature logic.

## Next.js and React Rules

- Default to **Server Components**; add `"use client"` only for interactivity (forms, mobile nav Sheet, Swiper, hooks).
- Keep `app/**/page.tsx` thin — compose from `src/features/` and `src/components/`.
- Keep API calls and client-safe config in `src/lib/` or `src/features/*/services/`.
- Do not import server-only Node modules into Client Components or shared client bundles.
- Use path aliases (`@/*`) consistently per `tsconfig.json`.
- Co-locate feature-specific components and types within each feature folder; shared Zod schemas live in `src/schemas/`.
- Prefer static rendering for marketing sections; use dynamic behavior only where required.
- Consider `middleware` or `next.config` redirect for `/home` → `/` parity with the v1 site.

## TypeScript Strict Rules

- `strict` must remain enabled in `tsconfig.json`.
- Do not use `any`. If unavoidable, use `unknown` first and narrow safely.
- Do not silence errors with `@ts-ignore` unless a documented external bug forces it.
- Prefer exact domain types, discriminated unions, and explicit null handling.
- Every public function must have a clear input and output type.
- Avoid optional fields unless they are truly optional in the domain.

## Environment Variable Protection

Environment handling must prevent accidental client exposure.

- **Client-safe config:** only `NEXT_PUBLIC_*` variables, accessed in Client Components or shared client modules via a single module such as `src/lib/client-env.ts` when needed.
- **Server secrets:** load only in server modules (`app/api/**`, Server Components, `src/lib/env.ts`) via `process.env`, never prefixed with `NEXT_PUBLIC_`.
- Secrets must never be read directly from arbitrary files in components.
- Never spread `process.env` into config objects, logs, or API responses.
- Validate server env at module load with Zod and fail fast when values are malformed.
- `.gitignore` must explicitly ignore `.env`, `.env.local`, and `.env.production`.
- Provide `.env.example` with safe placeholder values only.

Example (server-only):

```ts
import { z } from "zod";

const envSchema = z.object({
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  CONTACT_WEBHOOK_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

**v1 server env:** Optional — reserved for v1.1 form APIs (`RATE_LIMIT_*`, `CONTACT_WEBHOOK_URL`). See `.env.example`. No `CORS_ORIGIN` — same-origin only.

## Authentication Rules

Not required for the public marketing site in v1. If admin dashboards or protected content are added:

- Authentication checks must happen on the server (Route Handlers, Server Actions, or middleware), never only in the client.
- Authorization must be separate from authentication.
- Use deny-by-default access control.
- Never trust role or user ID values from the client without server-side verification.
- Cookies must be `HttpOnly`, `Secure` in production, and use appropriate `SameSite` settings.

## Database Connection Rules

No database is used in v1. If persistence is introduced (e.g. lead storage):

- Use a single database client factory or singleton in `src/lib/db.ts` (server-only).
- Database modules must not be imported by Client Components or client bundles.
- Never create ad hoc connections inside Route Handlers or React components.
- Do not expose raw database errors to clients.
- Wrap database operations in repository/service layers.
- Transactions are required for multi-step writes that must succeed or fail together.

## Validation Rules for Text Fields

All external text input must be validated before business logic or persistence.

- Validate at the Route Handler boundary before calling services.
- Use Zod schemas in `src/schemas/` shared by API and forms where safe (split client/server variants if secrets are involved).
- Trim input unless whitespace is business-significant.
- Enforce min/max length on all text fields.
- Reject control characters and invisible unsafe characters where not needed.
- Normalize text where appropriate for comparison, such as email lowercasing.
- Client-side validation improves UX but never replaces server-side validation.

Recommended baseline for standard text fields:

- `trim()`
- min length > 0 when required
- max length explicitly defined
- reject unexpected HTML if field is plain text
- reject dangerous Unicode control characters if not required

**Form field rules:** see `PROJECT_INFO_NEXT.md` §7 (Contact and Get Started).

## SQL Injection Prevention Rules

Apply when a database is introduced.

- Never concatenate SQL with user input.
- Always use parameterized queries, prepared statements, or a trusted ORM/query builder.
- Dynamic sorting, filtering, table names, and column names must be chosen from server-side allowlists.

## API Route Rules (Route Handlers)

Keep handlers in `app/api/**/route.ts` thin and defensive:

- Parse request
- Validate input DTO (Zod schema from `src/schemas/`)
- Apply rate limiting on public POST routes when v1.1 form APIs ship (Vercel-compatible — KV, Upstash, or edge middleware)
- Call service in `src/features/*/services/` or `src/lib/`
- Map result to response DTO
- Return safe response

**v1 endpoints:** `GET /api/health` only. **v1.1:** `POST /api/contact`, `POST /api/get-started` — contracts in `PROJECT_INFO_NEXT.md` §5.

Route handlers must not:

- contain raw SQL (when DB exists)
- contain reusable business rules (use services)
- trust unchecked input
- leak stack traces or internal error details

## DTO Rules

- Every inbound request body must map to an input DTO.
- Every outbound response must map to an output DTO.
- DTOs must not contain secrets, internal flags, or raw error details.
- Mapping must be explicit in route handlers or dedicated mapper functions.

## Error Handling and Logging

- Return generic client-safe error messages from APIs.
- Log enough for diagnosis without leaking secrets, tokens, or full connection strings.
- Security-relevant failures should be logged with care and rate-limited where necessary.
- Validation errors should be explicit to the client, but only for safe fields and safe messages.

## UI and Accessibility Rules

- Design mobile-first; test at 320px–768px breakpoints before desktop polish.
- Add default hover states for buttons unless a clear UX reason prevents it.
- Add subtle click or press feedback for interactive elements.
- Use semantic HTML (`nav`, `main`, `section`, `footer`, `button`, `a`).
- Provide meaningful `alt` text for images.
- Ensure sufficient color contrast for text on gradient backgrounds.
- Do not use `alert()` for production user feedback; use accessible inline messages or toasts.
- Rebrand all user-facing copy to **Xone Software Development** (not StuTech).

## Testing Expectations

- Add unit tests for validators, form schemas, and utility functions.
- Add integration tests for Route Handlers (target parity with source ~35 tests).
- Add smoke tests for critical pages and forms (React Testing Library + Vitest).
- Test failure paths, not only happy paths.
- Use **Vitest** at repo root (`npm run test`).
- On Linux CI, prefer explicit test paths (e.g. `tests/*.test.ts`) over fragile shell globs.

## CI/CD Rules

GitHub Actions enforce quality on every push and pull request. Read `TEAM_INSTRUCTIONS.md` before changing workflows.

- **CI** (`.github/workflows/ci.yml`): single job at repo root — lint → test → `next build`.
- **CD:** Vercel production deploy (connected to `main`); no GitHub Pages workflow.
- Never store secrets, tokens, or `.env` values in workflow files or logs. Use GitHub repository secrets/variables and Vercel env dashboard only.
- CI must pass before merging or deploying. Do not disable checks to unblock without Tech Lead approval.
- Keep workflows minimal and fast. Add jobs only when they map to a real script in `package.json`.

## Review Checklist

Before merging, verify all of the following:

- No secret env usage in client code (no non-`NEXT_PUBLIC_` vars in Client Components or client bundles)
- `.env` files are gitignored and not committed
- All external input validated server-side on Route Handlers
- Email CTAs use `buildContactMailto()` from `src/lib/brand.ts` — do not hardcode addresses in components
- Rate limiting required when POST form routes ship (v1.1)
- No raw SQL built from string concatenation (when DB exists)
- Mobile layout reviewed for changed pages
- TypeScript strictness preserved
- Brand and copy consistent with **Xone Software Development**
- Images and assets exist under `public/` with correct paths
- No `console.log` of user PII in production code
- GitHub Actions CI passes (lint, test, build)
- Workflow or Vercel config changes reviewed by Tech Lead or Fullstack Developer

## Agent Instruction

When modifying this project, read `AGENTS.md`, `TEAM_INSTRUCTIONS.md`, and `PROJECT_INFO_NEXT.md` first.

When modifying this project:

- preserve TypeScript strictness
- preserve feature-based boundaries
- keep secrets out of the client bundle
- validate all external input at the Route Handler boundary
- prefer Server Components; use Client Components only when needed
- reject insecure shortcuts even if they appear faster
- provide a brief explanation when creating features or fixing errors
- when solving errors, identify the likely source of the issue and the recommended solution
- keep explanations concise and educational so a junior fullstack developer can follow the reasoning
- consider mobile view by default when creating frontend UI
- port from `xone-swe-web` source files — do not reimplement from memory
- after every feature or content change, end with a **brief commit message** (1 line, repo style: `type(scope): summary`) for the user to commit manually — do not run `git commit` unless explicitly asked
