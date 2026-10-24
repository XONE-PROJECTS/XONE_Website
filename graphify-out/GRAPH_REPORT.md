# Graph Report - xone-swe-next (2026-10-25)

## Corpus Check

- cluster-only mode — file stats not available

## Summary

- 728 nodes · 1861 edges · 37 communities (31 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `48f7ab43`
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
- repository.ts
- PreFlightIntro.tsx
- components.json
- devDependencies
- TeamStripSection.tsx
- auth.ts
- dependencies
- compilerOptions
- AdminDashboard.tsx
- package.json
- AdminDashboard
- EditorFields.tsx
- content/route.ts
- getMongoDatabase
- scripts
- builder.ts
- env.ts
- eslint.config.mjs
- preview.ts
- AdminSkeleton
- admin/page.tsx
- health/route.ts
- react-icons
- postcss.config.mjs
- prettier.config.mjs
- MediaPanel
- ProcessSection.tsx
- jsdom@^26.1.0

## God Nodes (most connected - your core abstractions)

1. `cn()` - 57 edges
2. `next` - 49 edges
3. `AdminDashboard()` - 26 edges
4. `getPublishedContent()` - 25 edges
5. `buttonVariants` - 25 edges
6. `react` - 23 edges
7. `CmsPublicPage()` - 20 edges
8. `getMongoDatabase()` - 20 edges
9. `createCmsPageMetadata()` - 18 edges
10. `BRAND_NAME` - 18 edges

## Surprising Connections (you probably didn't know these)

- `GET()` --calls--> `getMongoDatabase()` [EXTRACTED]
  app/api/admin/media/[assetId]/route.ts → src/lib/mongodb.ts
- `RootLayout()` --calls--> `Navbar()` [EXTRACTED]
  app/layout.tsx → src/components/navbar.tsx
- `AdminPage()` --calls--> `getAdminSession()` [EXTRACTED]
  app/admin/page.tsx → src/features/admin/lib/auth.ts
- `POST()` --calls--> `isSafeMutationRequest()` [EXTRACTED]
  app/api/admin/content/route.ts → src/features/admin/lib/auth.ts
- `PUT()` --calls--> `isSafeMutationRequest()` [EXTRACTED]
  app/api/admin/content/route.ts → src/features/admin/lib/auth.ts

## Import Cycles

- None detected.

## Communities (37 total, 6 thin omitted)

### Community 0 - "CmsPublicPageView.tsx"

Cohesion: 0.06
Nodes (80): @base-ui/react, lucide-react, react, LearnMoreButton(), LearnMoreButtonProps, PillButton(), PillButtonProps, ProjectCard() (+72 more)

### Community 1 - "content.ts"

Cohesion: 0.05
Nodes (54): FooterProps, Asset(), Block(), BuilderElement(), ComponentBlock(), componentGridClass(), ComponentHeading(), gridClass() (+46 more)

### Community 2 - "next"

Cohesion: 0.09
Nodes (37): AboutPage(), generateMetadata(), ContactPage(), generateMetadata(), generateMetadata(), generateMetadata(), HomePage(), generateMetadata() (+29 more)

### Community 3 - "mobile.ts"

Cohesion: 0.10
Nodes (22): assertDesktopNav(), assertElementMinHeight(), assertFlexDirection(), assertGridColumnCount(), assertMinFontSize(), visitHomeWithPreflight(), visitRouteDesktop(), assertMinTouchTarget() (+14 more)

### Community 4 - "steps"

Cohesion: 0.06
Nodes (30): concurrency, cancel-in-progress, group, CI, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, SITE_URL, jobs (+22 more)

### Community 5 - "design.ts"

Cohesion: 0.11
Nodes (26): ChromeFields(), HistoryPanel(), historySchema, mediaSchema, StyleFields(), patch(), TextInput(), ThemePanel() (+18 more)

### Community 6 - "admin-renderer.test.ts"

Cohesion: 0.14
Nodes (20): AdminPreviewPage(), dynamic, metadata, revalidate, dynamic, RootLayout(), Footer(), CmsPublicBuilder() (+12 more)

### Community 7 - "repository.ts"

Cohesion: 0.14
Nodes (17): vitest, defaultContent, parseSiteContent(), CmsConflictError, CmsStorageError, ContentDocument, ContentState, CURRENT_CONTENT_VERSION (+9 more)

### Community 8 - "PreFlightIntro.tsx"

Cohesion: 0.16
Nodes (17): PreFlightIntro(), ObjectiveItemState, PreflightObjectivesStep(), PreflightObjectivesStepProps, PreflightReasonsStep(), PreflightReasonsStepProps, PreFlightStep(), PreFlightStepProps (+9 more)

### Community 9 - "components.json"

Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "devDependencies"

Cohesion: 0.10
Nodes (21): devDependencies, eslint-config-next@15.5.28, husky@^9.1.7, @playwright/test@^1.61.0, postcss@^8.5.6, prettier@^3.8.4, @tailwindcss/postcss@^4.1.13, @testing-library/jest-dom@^6.9.1 (+13 more)

### Community 11 - "TeamStripSection.tsx"

Cohesion: 0.17
Nodes (13): sizeClasses, TeamMemberAvatar(), TeamMemberAvatarProps, getSocialLinks(), SocialLinkItem, TeamMemberSocialLinks(), TeamMemberSocialLinksProps, MissionSection() (+5 more)

### Community 12 - "auth.ts"

Cohesion: 0.20
Nodes (16): loginSchema, POST(), POST(), adminCookieName, AdminUserDocument, configured(), createAdminSession(), deleteAdminSession() (+8 more)

### Community 13 - "dependencies"

Cohesion: 0.10
Nodes (20): dependencies, @base-ui/react@^1.5.0, class-variance-authority@^0.7.1, clsx@^2.1.1, @fontsource-variable/geist@^5.2.9, lucide-react@^1.17.0, mongodb@^7.7.0, next@15.5.28 (+12 more)

### Community 14 - "compilerOptions"

Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 15 - "AdminDashboard.tsx"

Cohesion: 0.18
Nodes (15): InspectableNode, Inspector(), label(), pageLabels, Panel, EditorCanvas(), inline(), widths (+7 more)

### Community 16 - "package.json"

Cohesion: 0.12
Nodes (16): eslint@^9.35.0, lint-staged@^17.6.0, tailwindcss@^4.1.13, @types/node@^24.5.2, typescript@^5.9.2, lint-staged, _.{css,json,md}, _.{js,mjs,cjs,jsx,ts,tsx} (+8 more)

### Community 17 - "AdminDashboard"

Cohesion: 0.20
Nodes (13): AdminDashboard(), broadcast(), change(), changePage(), updateCollectionItem(), updateElement(), updateSection(), updateStyles() (+5 more)

### Community 18 - "EditorFields.tsx"

Cohesion: 0.27
Nodes (15): blockLabel(), BlockSettings(), CollectionItemSettings(), CollectionSettings(), ColumnField(), createClientId(), ElementFields(), Field() (+7 more)

### Community 19 - "content/route.ts"

Cohesion: 0.20
Nodes (13): failure(), GET(), POST(), PUT(), zod@^4.4.3, zod, SiteContent, publishRequestSchema (+5 more)

### Community 20 - "getMongoDatabase"

Cohesion: 0.28
Nodes (14): failure(), GET(), POST(), allowedTypes, GET(), isSafeSvg(), POST(), requireAdmin() (+6 more)

### Community 21 - "scripts"

Cohesion: 0.14
Nodes (14): scripts, build, dev, format, format:check, lint, prepare, start (+6 more)

### Community 22 - "builder.ts"

Cohesion: 0.22
Nodes (13): blockElement(), BuilderNode, cloneNode(), CollectionBlock, CollectionItem, emptyColumn(), emptyRow(), emptySection() (+5 more)

### Community 23 - "env.ts"

Cohesion: 0.21
Nodes (8): dynamic, GET(), mongodb, env, envSchema, optionalWebhookUrl, parseServerEnv(), ServerEnv

### Community 24 - "eslint.config.mjs"

Cohesion: 0.20
Nodes (8): compat, **dirname, eslintConfig, **filename, eslint-config-prettier@^10.1.8, @eslint/eslintrc@^3.3.1, eslint-config-prettier, @eslint/eslintrc

### Community 25 - "preview.ts"

Cohesion: 0.43
Nodes (4): POST(), createPreviewToken(), hashToken(), PreviewTokenDocument

### Community 26 - "AdminSkeleton"

Cohesion: 0.53
Nodes (4): Loading(), AdminSkeleton(), delays, SkeletonBar()

### Community 27 - "admin/page.tsx"

Cohesion: 0.47
Nodes (3): AdminPage(), dynamic, AdminLogin()

### Community 28 - "health/route.ts"

Cohesion: 0.53
Nodes (3): GET(), createHealthPayload(), HealthPayload

### Community 29 - "react-icons"

Cohesion: 0.40
Nodes (3): react-icons@^5.6.0, react-icons, valueProps

### Community 32 - "MediaPanel"

Cohesion: 1.00
Nodes (3): MediaPanel(), load(), upload()

## Knowledge Gaps

- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `CmsPublicPageView.tsx`, `content.ts`, `admin-renderer.test.ts`, `repository.ts`, `PreFlightIntro.tsx`, `TeamStripSection.tsx`, `auth.ts`, `dependencies`, `package.json`, `content/route.ts`, `getMongoDatabase`, `env.ts`, `preview.ts`, `health/route.ts`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Should `CmsPublicPageView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06334371754932502 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CmsPublicPageView.tsx` to `content.ts`, `design.ts`, `admin-renderer.test.ts`, `PreFlightIntro.tsx`, `dependencies`, `AdminDashboard.tsx`, `package.json`, `EditorFields.tsx`, `content/route.ts`, `admin/page.tsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `content.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05384615384615385 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `mobile.ts` to `package.json`, `content.ts`, `devDependencies`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.09292929292929293 - nodes in this community are weakly interconnected._
- **Should `mobile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._
