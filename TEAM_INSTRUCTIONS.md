# TEAM_INSTRUCTIONS.md

Role-based instructions for the **Xone Software Development** Next.js marketing site (`xone-swe-next`).

**v1 lead capture:** Email-only (`mailto:`) + `/projects` — no online forms until v1.1.

**Before any task or commit:** read `AGENTS.md`, `PROJECT_INFO_NEXT.md`, and this file first. Local checks (`npm run lint`, `npm run test`, `npm run build`) must match what GitHub Actions runs in `.github/workflows/ci.yml`.

---

## Senior Roles

### Project Manager (PM)

**Responsibilities**

- Own the product backlog in `BACKLOGS_v1.md` and sprint plan in `SPRINT_PLAN_v1.md` (port or create for Next repo)
- Facilitate sprint ceremonies (planning, standup, review, retro)
- Track blockers, dependencies, and stakeholder sign-off on brand/copy
- Ensure scope stays aligned with static lead-gen goals (avoid scope creep into full app features)
- Communicate phase status using `PROJECT_INFO_NEXT.md` build phases and `PROJECT_OVERVIEW.md` when available
- Confirm Vercel production QA against acceptance criteria in `PROJECT_INFO_NEXT.md` §17

**Workflow**

1. Review backlog weekly with Tech Lead
2. Prioritize by build phase: bootstrap → API → core pages → polish/deploy
3. Accept work only when acceptance criteria in the sprint plan are met
4. Escalate security, rate-limit, or architecture concerns to Tech Lead immediately

### Tech Lead

**Responsibilities**

- Enforce `AGENTS.md` in code review
- Approve structural changes (App Router routes, feature folders, env strategy, rate-limit approach)
- Resolve cross-role technical blockers
- Define porting standards from `xone-swe-web` (Vite + Express) to Next.js Route Handlers
- Review security posture before Vercel production deploy
- Sign off on rate-limiting choice when v1.1 form APIs are approved (Vercel KV, Upstash, or edge middleware)

**Workflow**

1. Review all PRs for security, TypeScript strictness, and folder conventions
2. Pair with Fullstack on API Route Handler design before form wiring
3. Maintain architecture decision log in PR descriptions or team wiki
4. Sign off on Phase 0–1 exit criteria in `PROJECT_INFO_NEXT.md`

---

## Fullstack Developer

**Responsibilities**

- Bootstrap and maintain the single Next.js app at repo root
- Own `.github/workflows/ci.yml`, `next.config.ts`, `.env.example`, and Vercel project settings
- Implement `/projects` and email-only `/contact`; maintain `GET /api/health`
- Form POST routes (`/api/contact`, `/api/get-started`) are **v1.1** — do not implement without PM approval
- Own `README.md` accuracy and local dev ergonomics
- Bridge `src/schemas/`, `src/features/*/services/`, and `app/api/**/route.ts`

**Workflow**

1. Clone repo; run `npm install`, then `npm run dev` (Turbopack) from repo root
2. Create root `.env.example` from `PROJECT_INFO_NEXT.md` §5 — never commit real `.env`
3. v1: use `buildContactMailto()` from `src/lib/brand.ts` for all email CTAs
4. v1.1 (when approved): shared Zod in `src/schemas/` + Route Handlers + client forms
5. Add **unit and integration tests** for validation, services, and Route Handlers
6. Run `npm run lint`, `npm run test`, and `npm run build` before every commit
7. Submit PRs that span API + UI when a feature requires both

**Coding standards:** `AGENTS.md` — validation at Route Handler boundary, no secrets in `NEXT_PUBLIC_*` misuse, feature-based folders under `src/`.

---

## Backend Developer (API / Server)

**Responsibilities**

- Build and maintain Route Handlers in `app/api/` for lead capture
- Input validation (Zod), rate limiting (Vercel-compatible), safe error responses
- Optional integrations: webhook (`CONTACT_WEBHOOK_URL`), logging
- Server-only modules in `src/lib/` (env, validation helpers, rate limit client)

**Current state:** Phase 0 + static lead capture done. Week 2: port homepage and core pages from `xone-swe-web`.

**Workflow**

1. Do not implement APIs described in legacy `Technical Documentation` unless PM adds them to backlog
2. Port behavior from `xone-swe-web/BackEnd/src/` — match response contracts in `PROJECT_INFO_NEXT.md` §5
3. For contact/get-started: validated DTO, rate limit, generic success/error shapes
4. Never return stack traces or internal errors to clients
5. Keep all secrets in server env only (no `NEXT_PUBLIC_` prefix)
6. Add **unit tests** for validators, services, and route handlers for each endpoint
7. Run `npm run lint` and `npm run test` before every commit
8. Add integration tests for new routes before merge

**Out of scope for v1:** User authentication, JWT, PostgreSQL, separate Express/Railway service.

---

## Frontend Developer

**Responsibilities**

- Implement marketing pages via `app/**/page.tsx` composing `src/features/` modules
- Rebrand UI to **Xone Software Development**
- Mobile-first responsive layouts
- Mark interactive pieces with `"use client"` (Navbar, forms, Swiper) per `PROJECT_INFO_NEXT.md` §6
- Place static assets in `public/assets/XONE/xone_brand_kit/`
- Use **shadcn/ui** from `src/components/ui/`; add with `npx shadcn@latest add <component>`

**Workflow**

1. One feature or page per PR when possible
2. Keep route files thin; put sections and page logic in `src/features/<name>/`
3. Port from `xone-swe-web/FrontEnd/src/features/` and `views/` — see route map in `PROJECT_INFO_NEXT.md` §4
4. Replace placeholder `#` footer links with `/privacy` and `/terms`
5. Replace `alert()` with accessible inline form feedback
6. Add or update **unit tests** for components and utilities you introduce
7. Run `npm run lint`, `npm run test`, and `npm run build` before every commit

**UI checklist per page**

- Works at 375px and 1280px widths
- Hover/press states on buttons
- Semantic HTML and alt text on images
- No hardcoded StuTech branding

---

## QA Engineer

**Responsibilities**

- Define and execute test plans per sprint acceptance criteria and `PROJECT_INFO_NEXT.md` §10 post-deploy checks
- Cross-browser smoke tests (Chrome, Firefox, Safari, Edge)
- Mobile device or emulator testing
- Regression on navigation, forms, and external links
- Log defects with repro steps, severity, and screenshots

**Workflow**

1. Read sprint acceptance criteria before testing
2. Verify production build (`npm run build` + `npm run start`) not only dev server
3. Test email links (`mailto:`, `tel:`) on Contact and Projects pages
4. Test `/get-started` redirect to `/projects`
5. Confirm no console errors on primary routes
6. Block release if secrets appear in client bundle or `.env` is committed
7. Confirm GitHub Actions CI is green on the shared active branch before sign-off
8. On Vercel: verify `GET /api/health`, email CTAs, and footer legal links

**Test priorities (bootstrap / Phase 0–2)**

| Priority | Area                                                        |
| -------- | ----------------------------------------------------------- |
| P0       | App builds and starts (`npm run dev`, `npm run build`)      |
| P0       | All nav links resolve to real App Router pages              |
| P1       | Homepage renders on mobile without horizontal scroll        |
| P1       | Images load from `public/assets/`                           |
| P1       | `GET /api/health` returns `{ success: true, status: "ok" }` |
| P2       | Email CTAs and Projects page on mobile/desktop              |
| P2       | Lighthouse performance/accessibility baseline               |

---

## Shared Workflows

### Git and PRs

- **Do not create new branches.** Work only on the branch that is currently active in the repo (check with `git branch --show-current` before you start).
- **Commit directly to that active branch** — do not open personal or feature branches unless the Tech Lead or PM explicitly instructs otherwise.
- Pull latest changes before you commit (`git pull`) to reduce merge conflicts with teammates on the same branch.
- PR description (when used): what, why, screenshots for UI, test notes
- At least one approval from Tech Lead for architecture-impacting changes
- Do not commit `.env`, `node_modules`, or `.next/` build output

### Commits (manual, per teammate)

Each teammate commits their own work to the **shared active branch**. Use **brief, role-scoped messages** in imperative mood (`add`, `fix`, `update`, `docs`). One logical change per commit when practical.

| Role          | When to commit                                         | Example commit messages                                                                          |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **PM**        | Backlog, sprint plan, or spec updates                  | `docs: update Phase 2 acceptance criteria` · `docs: reprioritize contact form in backlog`        |
| **Tech Lead** | AGENTS.md, architecture, security, review-driven fixes | `docs: clarify NEXT_PUBLIC env rules` · `fix: enforce rate limit on contact route`               |
| **Fullstack** | Bootstrap, README, env, API + UI wiring, CI            | `chore: bootstrap Next.js app with Turbopack` · `feat: wire contact form to POST /api/contact`   |
| **Backend**   | Route Handlers, validation, rate limit, webhooks       | `feat: add Zod-validated contact route handler` · `fix: return generic error on webhook failure` |
| **Frontend**  | Pages, components, rebrand, assets                     | `feat: add Xone-branded services page` · `fix: mobile hero overflow on homepage`                 |
| **QA**        | Test docs, fixtures, or automation only                | `test: add contact form validation cases` · `docs: record Vercel smoke test results`             |

**Format:** `<type>: <short summary>` — types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`.

Husky hooks are installed by `npm install`: `pre-commit` runs lint-staged to
auto-fix ESLint and format staged files, while `pre-push` runs the full lint
and formatting checks. Pushes are blocked until both checks pass.

**Before every commit:**

1. `git branch --show-current` — confirm you are on the team’s active branch
2. `git pull` — sync with teammates’ latest commits
3. `git status` — confirm no `.env`, `node_modules`, or `.next/` are staged
4. **`npm run lint`** — fix all lint errors
5. **`npm run test`** — add tests for each feature you added or modified
6. **`npm run build`** — confirm `next build` succeeds when app code or config changed
7. Commit and push only when steps 4–6 pass (or are N/A for docs-only commits per table below)

**Test expectations by change type**

| Change                      | Required tests                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| New page or feature module  | Component or smoke tests for main render paths and key interactions             |
| Form or validation logic    | Unit tests for valid input, invalid input, and edge cases                       |
| Route Handler or service    | Unit tests for validator, service, and handler; mock external services          |
| Utility or mapper           | Pure function unit tests                                                        |
| Docs-only (`docs:` commits) | Lint if markdown tooling applies; tests not required unless docs accompany code |

### Definition of Done

- [ ] Matches acceptance criteria in current sprint / `PROJECT_INFO_NEXT.md` phase
- [ ] `AGENTS.md` review checklist satisfied
- [ ] TypeScript strict — no new `any`
- [ ] `npm run lint` passes
- [ ] Unit tests added/updated; `npm run test` passes
- [ ] `npm run build` passes when code changed
- [ ] Mobile layout checked
- [ ] No secrets in client bundle
- [ ] README or team docs updated if setup changed

### CI/CD (GitHub Actions + Vercel)

| Layer             | Trigger                                       | What it runs                                                                                                 |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **CI** (`ci.yml`) | Every push and pull request                   | `npm run lint` → `npm run format:check` → `npm run test:unit` → `npm run build` → Playwright E2E (repo root) |
| **CD** (Vercel)   | Push/merge to `main` (Vercel Git integration) | Production deploy after CI green; env vars in Vercel dashboard                                               |

**No GitHub Pages workflow.** App Router handles routing; do not add SPA rewrite rules.

**Roles**

| Role                   | CI/CD responsibility                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Fullstack**          | Maintain `ci.yml`; connect Vercel project; document env vars in `.env.example` and README       |
| **Tech Lead**          | Approve workflow, `next.config.ts` security headers, and Vercel env changes                     |
| **Frontend / Backend** | Ensure new features include tests so CI stays green                                             |
| **QA**                 | Treat red CI as a release blocker; run `PROJECT_INFO_NEXT.md` §10 checklist after Vercel deploy |
| **PM**                 | Track infra backlog items; coordinate deploy sign-off with QA                                   |

**Example commit messages:** `ci: add lint and build workflow` · `ci: fix vitest path on Ubuntu` · `chore: document Vercel env setup`

### Communication

- Blockers posted within 4 business hours
- Scope changes go through PM for backlog update
- Security issues: notify Tech Lead immediately, do not deploy

### Document Map

| Question                                | Document                                             |
| --------------------------------------- | ---------------------------------------------------- |
| Full Next.js spec and porting map       | `PROJECT_INFO_NEXT.md`                               |
| How do I run the project?               | `README.md` (create during bootstrap)                |
| What are the coding rules?              | `AGENTS.md`                                          |
| What should I work on next?             | `BACKLOGS_v1.md`, `SPRINT_PLAN_v1.md`                |
| What is the project status?             | `PROJECT_OVERVIEW.md` (when created)                 |
| v1 source to port from                  | `xone-swe-web` repo (read-only)                      |
| What did the original authors document? | `Technical Documentation` in source repo (read-only) |
