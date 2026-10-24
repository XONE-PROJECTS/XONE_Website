# Graph Report - xone-swe-next (2026-10-25)

## Corpus Check

- 152 files · ~58,064 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, .css 3, .psd 2)

## Summary

- 949 nodes · 2276 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `fb5ee5b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- CmsPublicPageView.tsx
- content.ts
- next
- mobile.ts
- steps
- design.ts
- admin-renderer.test.ts
- vitest
- cn
- components.json
- devDependencies
- TeamStripSection.tsx
- repository.ts
- dependencies
- compilerOptions
- AdminDashboard.tsx
- lint-staged
- AdminDashboard
- EditorFields.tsx
- catalog.ts
- AGENTS.md
- scripts
- builder.ts
- Shared Workflows
- eslint.config.mjs
- PROJECT_OVERVIEW.md
- AdminSkeleton
- Xone Software Development — Next.js Site
- health/route.ts
- react-icons
- postcss.config.mjs
- prettier.config.mjs
- MediaPanel
- ProcessSection.tsx
- SPRINT_PLAN_v1.md
- PROJECT_INFO_NEXT.md — Next.js Rebuild Brief
- Deployment guide — Vercel (Next.js)
- BACKLOGS_v1.md
- Post-deploy verification (QA-05)
- Testing
- Week 4 — Phase 3 Polish + Vercel Deploy
- Week 2 — Phase 2 Core Pages (Part 1)

## God Nodes (most connected - your core abstractions)

1. `cn()` - 55 edges
2. `next` - 48 edges
3. `react` - 28 edges
4. `AdminDashboard()` - 27 edges
5. `getPublishedContent()` - 25 edges
6. `ProjectEstimator()` - 24 edges
7. `buttonVariants` - 23 edges
8. `buildContactMailto()` - 23 edges
9. `CmsPublicPage()` - 20 edges
10. `getMongoDatabase()` - 20 edges

## Surprising Connections (you probably didn't know these)

- `Review Checklist` --references--> `buildContactMailto()` [INFERRED]
  AGENTS.md → src/lib/brand.ts
- `Fullstack Developer` --references--> `buildContactMailto()` [INFERRED]
  TEAM_INSTRUCTIONS.md → src/lib/brand.ts
- `YOUR ACTION — Step 3: Environment variables` --references--> `getSiteUrl()` [INFERRED]
  DEPLOY.md → src/lib/site.ts
- `6. Brand and design system` --references--> `MissionSection()` [INFERRED]
  PROJECT_INFO_NEXT.md → src/features/home/components/MissionSection.tsx
- `Commits (manual, per teammate)` --references--> `add()` [INFERRED]
  TEAM_INSTRUCTIONS.md → src/features/services/estimator/pricing.ts

## Import Cycles

- None detected.

## Communities (44 total, 5 thin omitted)

### Community 0 - "CmsPublicPageView.tsx"

Cohesion: 0.05
Nodes (83): ProjectCard(), ProjectCardLinkProps, ProjectCardProps, ProjectsLinkButton(), buttonVariants, Card(), CardContent(), CardDescription() (+75 more)

### Community 1 - "content.ts"

Cohesion: 0.07
Nodes (32): FooterProps, blockBase, blockSchema, builderColumnSchema, builderElementBase, builderElementSchema, builderRowSchema, builderSectionSchema (+24 more)

### Community 2 - "next"

Cohesion: 0.09
Nodes (38): AboutPage(), generateMetadata(), ContactPage(), generateMetadata(), generateMetadata(), generateMetadata(), HomePage(), generateMetadata() (+30 more)

### Community 3 - "mobile.ts"

Cohesion: 0.11
Nodes (25): assertDesktopNav(), assertElementMinHeight(), assertFlexDirection(), assertGridColumnCount(), assertMinFontSize(), visitHomeWithPreflight(), visitRouteDesktop(), assertMinTouchTarget() (+17 more)

### Community 4 - "steps"

Cohesion: 0.06
Nodes (30): concurrency, cancel-in-progress, group, CI, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, SITE_URL, jobs (+22 more)

### Community 5 - "design.ts"

Cohesion: 0.12
Nodes (24): ChromeFields(), HistoryPanel(), historySchema, mediaSchema, StyleFields(), patch(), TextInput(), ThemePanel() (+16 more)

### Community 6 - "admin-renderer.test.ts"

Cohesion: 0.14
Nodes (18): AdminPreviewPage(), dynamic, metadata, revalidate, dynamic, RootLayout(), react-dom, Footer() (+10 more)

### Community 7 - "vitest"

Cohesion: 0.25
Nodes (4): vitest@^3.2.4, vitest, requireAdmin, saveDraft

### Community 8 - "cn"

Cohesion: 0.08
Nodes (48): @base-ui/react, lucide-react, react, LearnMoreButton(), LearnMoreButtonProps, PillButton(), PillButtonProps, Navbar() (+40 more)

### Community 9 - "components.json"

Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "devDependencies"

Cohesion: 0.08
Nodes (35): devDependencies, eslint@^9.35.0, eslint-config-next@15.5.28, husky@^9.1.7, jsdom@^26.1.0, lint-staged@^17.6.0, @playwright/test@^1.61.0, postcss@^8.5.6 (+27 more)

### Community 11 - "TeamStripSection.tsx"

Cohesion: 0.16
Nodes (14): 6. Brand and design system, sizeClasses, TeamMemberAvatar(), TeamMemberAvatarProps, getSocialLinks(), SocialLinkItem, TeamMemberSocialLinks(), TeamMemberSocialLinksProps (+6 more)

### Community 12 - "repository.ts"

Cohesion: 0.05
Nodes (70): AdminPage(), dynamic, failure(), GET(), POST(), PUT(), failure(), GET() (+62 more)

### Community 13 - "dependencies"

Cohesion: 0.10
Nodes (20): dependencies, @base-ui/react@^1.5.0, class-variance-authority@^0.7.1, clsx@^2.1.1, @fontsource-variable/geist@^5.2.9, lucide-react@^1.17.0, mongodb@^7.7.0, next@15.5.28 (+12 more)

### Community 14 - "compilerOptions"

Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 15 - "AdminDashboard.tsx"

Cohesion: 0.18
Nodes (15): InspectableNode, Inspector(), label(), pageLabels, Panel, EditorCanvas(), inline(), widths (+7 more)

### Community 16 - "lint-staged"

Cohesion: 0.67
Nodes (3): lint-staged, _.{css,json,md}, _.{js,mjs,cjs,jsx,ts,tsx}

### Community 17 - "AdminDashboard"

Cohesion: 0.20
Nodes (13): AdminDashboard(), broadcast(), change(), changePage(), updateCollectionItem(), updateElement(), updateSection(), updateStyles() (+5 more)

### Community 18 - "EditorFields.tsx"

Cohesion: 0.27
Nodes (15): blockLabel(), BlockSettings(), CollectionItemSettings(), CollectionSettings(), ColumnField(), createClientId(), ElementFields(), Field() (+7 more)

### Community 19 - "catalog.ts"

Cohesion: 0.07
Nodes (54): PriceFields(), PriceItem, PricingPanel(), EstimatorCatalog(), estimatorInputClass, EstimatorHosting(), TermSelect(), categories (+46 more)

### Community 20 - "AGENTS.md"

Cohesion: 0.10
Nodes (19): Agent Instruction, API Route Rules (Route Handlers), Authentication Rules, CI/CD Rules, Core Stack, Database Connection Rules, DTO Rules, Environment Variable Protection (+11 more)

### Community 21 - "scripts"

Cohesion: 0.14
Nodes (14): scripts, build, dev, format, format:check, lint, prepare, start (+6 more)

### Community 22 - "builder.ts"

Cohesion: 0.18
Nodes (14): blockElement(), BuilderNode, CollectionBlock, CollectionItem, EditorSelection, emptyColumn(), emptyRow(), emptySection() (+6 more)

### Community 23 - "Shared Workflows"

Cohesion: 0.13
Nodes (13): Backend Developer (API / Server), CI/CD (GitHub Actions + Vercel), Communication, Definition of Done, Document Map, Frontend Developer, Fullstack Developer, Git and PRs (+5 more)

### Community 24 - "eslint.config.mjs"

Cohesion: 0.20
Nodes (8): compat, **dirname, eslintConfig, **filename, eslint-config-prettier@^10.1.8, @eslint/eslintrc@^3.3.1, eslint-config-prettier, @eslint/eslintrc

### Community 25 - "PROJECT_OVERVIEW.md"

Cohesion: 0.17
Nodes (10): Brand, Current State, Open decisions (post-v1), Project Purpose, Related Documentation, Security posture (v1), Status: v1 shipped, Success criteria (+2 more)

### Community 26 - "AdminSkeleton"

Cohesion: 0.53
Nodes (4): Loading(), AdminSkeleton(), delays, SkeletonBar()

### Community 27 - "Xone Software Development — Next.js Site"

Cohesion: 0.17
Nodes (12): API, CI, Deployment (Vercel), Environment variables, Key routes, Prerequisites, Project structure, Quick start (+4 more)

### Community 28 - "health/route.ts"

Cohesion: 0.53
Nodes (3): GET(), createHealthPayload(), HealthPayload

### Community 29 - "react-icons"

Cohesion: 0.40
Nodes (3): react-icons@^5.6.0, react-icons, valueProps

### Community 32 - "MediaPanel"

Cohesion: 1.00
Nodes (3): MediaPanel(), load(), upload()

### Community 35 - "SPRINT_PLAN_v1.md"

Cohesion: 0.17
Nodes (11): Program Goal, Risks and Mitigations, Role Focus by Week, Theme, Theme, Timeline Overview, v1.1 Backlog (post-launch, optional), Week 1 Exit Criteria (+3 more)

### Community 36 - "PROJECT_INFO_NEXT.md — Next.js Rebuild Brief"

Cohesion: 0.06
Nodes (30): 10. Deployment (Vercel only), 11. CI (GitHub Actions), 12. Testing expectations, 13. Build phases (recommended order), 14. Out of scope (unless product direction changes), 15. Engineering rules (Next version), 16. Source repo reference map, 17. Success criteria (Next v1 done) (+22 more)

### Community 37 - "Deployment guide — Vercel (Next.js)"

Cohesion: 0.20
Nodes (10): Before you deploy (local), Deployment guide — Vercel (Next.js), Troubleshooting, v1 ship complete, v1 success criteria reminder, YOUR ACTION — Step 1: Push to GitHub, YOUR ACTION — Step 2: Create Vercel project, YOUR ACTION — Step 3: Environment variables (+2 more)

### Community 38 - "BACKLOGS_v1.md"

Cohesion: 0.22
Nodes (7): Decisions Log, Epic: Brand and Content (Xone), Epic: Frontend Architecture, Epic: Lead Capture API (Route Handlers) — **v1.1 deferred**, Epic: Page Completion, Epic: Project Foundation, Epic: QA and Deploy

### Community 39 - "Post-deploy verification (QA-05)"

Cohesion: 0.33
Nodes (6): Lead capture (email-only v1), Lighthouse (PERF-06), Post-deploy verification (QA-05), Routes (mobile 375px + desktop 1280px), Security headers (sample), SEO & infra

### Community 41 - "Testing"

Cohesion: 0.67
Nodes (3): E2E tests (Playwright), Testing, Unit tests

### Community 42 - "Week 4 — Phase 3 Polish + Vercel Deploy"

Cohesion: 0.67
Nodes (3): Theme, Week 4 Exit Criteria, Week 4 — Phase 3 Polish + Vercel Deploy

### Community 43 - "Week 2 — Phase 2 Core Pages (Part 1)"

Cohesion: 0.67
Nodes (3): Theme, Week 2 Exit Criteria, Week 2 — Phase 2 Core Pages (Part 1)

## Knowledge Gaps

- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `CmsPublicPageView.tsx`, `content.ts`, `admin-renderer.test.ts`, `vitest`, `cn`, `devDependencies`, `TeamStripSection.tsx`, `repository.ts`, `dependencies`, `health/route.ts`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Should `CmsPublicPageView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05470608222901801 - nodes in this community are weakly interconnected._
- **Why does `getSiteUrl()` connect `next` to `Deployment guide — Vercel (Next.js)`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `content.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06906906906906907 - nodes in this community are weakly interconnected._
- **Why does `Deployment guide — Vercel (Next.js)` connect `Deployment guide — Vercel (Next.js)` to `DEPLOY.md`, `Post-deploy verification (QA-05)`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.09350649350649351 - nodes in this community are weakly interconnected._
- **Should `mobile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10609756097560975 - nodes in this community are weakly interconnected._
