/* eslint-disable @next/next/no-img-element -- CMS image URLs are validated before rendering. */
import Link from "next/link";
import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import type { CmsBlock, CmsBuilderElement, CmsBuilderSection, PageKey, SiteContent } from "@/features/admin/lib/content";
import { responsiveCss } from "../lib/design";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import { HomeHero } from "@/features/home/components/HomeHero";
import { FeaturedProjectsSection } from "@/features/home/components/FeaturedProjectsSection";
import { TeamStripSection } from "@/features/home/components/TeamStripSection";
import { HomeCtaSection } from "@/features/home/components/HomeCtaSection";
import { PreFlightIntro } from "@/features/preflight/components/PreFlightIntro";
import { ServicesPageContent } from "@/features/services/components/ServicesPageContent";
import { serviceOfferings } from "@/features/services/data/services";
import { AboutPageContent } from "@/features/about/components/AboutPageContent";
import { ProcessPageContent } from "@/features/process/components/ProcessPageContent";
import { ProjectsPageContent } from "@/features/projects/components/ProjectsPageContent";
import { ProjectsCarousel } from "@/features/projects/components/ProjectsCarousel";
import { ContactPageContent } from "@/features/contact/components/ContactPageContent";
import { PrivacyPageContent } from "@/features/legal/components/PrivacyPageContent";
import { TermsPageContent } from "@/features/legal/components/TermsPageContent";
import { LegalPageLayout, type LegalPageContent } from "@/features/legal/components/LegalPageLayout";
import type { Project } from "@/features/projects/data/projects";
import type { TeamMember } from "@/lib/team-members";
import { BRAND_NAME } from "@/lib/brand";

type PublicPage = Exclude<PageKey, "footer">;

const serviceIcons = {
  cog: serviceOfferings[0].icon,
  palette: serviceOfferings[1].icon,
  globe: serviceOfferings[2].icon,
  mobile: serviceOfferings[3].icon,
} as const;

export function CmsPublicPageContent({ content, page, editing = false }: { content: SiteContent; page: PublicPage; editing?: boolean }): React.ReactNode {
  if (editing) return <CmsPublicBuilder content={content} page={page} />;
  const blocks = content.pages[page].blocks;
  switch (page) {
    case "prehome": return <PrehomePage blocks={blocks} />;
    case "home": return <HomePage blocks={blocks} prehomeBlocks={content.pages.prehome.blocks} />;
    case "services": return <ServicesPage blocks={blocks} />;
    case "about": return <AboutPage blocks={blocks} />;
    case "process": return <ProcessPage blocks={blocks} />;
    case "projects": return <ProjectsPage blocks={blocks} />;
    case "contact": return <ContactPage blocks={blocks} />;
    case "privacy": return <LegalPage blocks={blocks} kind="privacy" />;
    case "terms": return <LegalPage blocks={blocks} kind="terms" />;
  }
}

function CmsPublicBuilder({ content, page }: { content: SiteContent; page: PublicPage }): React.ReactNode {
  const sections = content.pages[page].sections;
  return <div className="cms-page min-h-full w-full bg-xone-section px-4 py-12 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl space-y-10">{sections.map((section) => <PublicSection key={section.id} section={section} page={page} editing />)}</div></div>;
}

function PublicSection({ section, page, editing }: { section: CmsBuilderSection; page: PublicPage; editing: boolean }): React.ReactNode {
  return <section data-cms-id={section.id} data-cms-kind="section" className={`cms-node space-y-8 ${!section.visible ? "cms-hidden" : ""}`}><style>{responsiveCss(section.id, section.styles)}</style>{section.rows.map((row) => <div key={row.id} data-cms-id={row.id} data-cms-kind="row" className={`cms-node grid gap-6 ${row.columns.length === 1 ? "grid-cols-1" : row.columns.length === 2 ? "grid-cols-1 md:grid-cols-2" : row.columns.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"}`}><style>{responsiveCss(row.id, row.styles)}</style>{row.columns.map((column) => <div key={column.id} data-cms-id={column.id} data-cms-kind="column" className="cms-node min-w-0 space-y-8"><style>{responsiveCss(column.id, column.styles)}</style>{column.elements.map((element) => <div key={element.id} data-cms-id={element.id} data-cms-kind="element" className={`cms-node ${element.type === "block" && !element.block.visible ? "cms-hidden" : ""}`}><style>{responsiveCss(element.id, element.styles)}</style><PublicElement element={element} page={page} editing={editing} /></div>)}</div>)}</div>)}</section>;
}

function PublicElement({ element, page, editing }: { element: CmsBuilderElement; page: PublicPage; editing: boolean }): React.ReactNode {
  if (element.type === "block") return <PublicBlock page={page} block={element.block} editing={editing} />;
  if (element.type === "text") return <p className="break-words leading-relaxed text-muted-foreground">{element.text}</p>;
  if (element.type === "heading") { const Tag = element.level; return <Tag className="break-words text-2xl font-semibold">{element.text}</Tag>; }
  if (element.type === "image") return <img src={element.src} alt={element.alt} className="max-h-[32rem] w-full rounded-xl object-contain" />;
  if (element.type === "button") return <Link href={element.href} className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-90">{element.label}</Link>;
  return <Link href={element.href} className="font-semibold text-xone-violet underline underline-offset-4">{element.label}</Link>;
}

function PublicBlock({ page, block, editing }: { page: PublicPage; block: CmsBlock; editing: boolean }): React.ReactNode {
  if (!block.visible) return null;
  if (page === "home" || page === "prehome") {
    if (block.type === "preflight") return editing ? <PreflightEditorPreview content={block} /> : <PreFlightIntro content={block} />;
  }
  if (page === "home") {
    if (block.type === "hero") return <HomeHero content={block} />;
    if (block.type === "projectCollection") return <FeaturedProjectsSection content={{ heading: block.heading, body: block.body, projects: block.items.map(toProject) }} />;
    if (block.type === "teamCollection") return <TeamStripSection content={{ heading: block.heading, body: block.body, members: block.items.map(toTeamMember) }} />;
    if (block.type === "cta") return <HomeCtaSection content={block} />;
  }
  if (page === "services" && block.type === "serviceCollection") return <ServicesPageContent content={{ heading: block.heading, body: block.body, items: block.items.map((item) => ({ id: item.title, title: item.title, description: item.description, highlights: item.highlights, icon: typeof item.icon === "string" ? serviceIcons[item.icon] : serviceIcons.cog })) }} />;
  if (page === "about") return <AboutBlock block={block} />;
  if (page === "process" && block.type === "processCollection") return <ProcessPageContent content={{ heading: block.heading, body: block.body, items: block.items.map((item) => ({ step: item.step, title: item.title, summary: item.description, details: item.details })) }} />;
  if (page === "projects") return <ProjectsBlock block={block} />;
  if (page === "contact" && block.type === "contact") return <ContactPageContent content={block} />;
  if ((page === "privacy" || page === "terms") && block.type === "legal") return <LegalPageLayout title={block.title} lastUpdated={block.lastUpdated} intro={block.intro} sections={block.sections} />;
  return <CmsPageRenderer blocks={[block]} />;
}

function PreflightEditorPreview({ content }: { content: Extract<CmsBlock, { type: "preflight" }> }): React.ReactNode {
  return <section className="rounded-2xl bg-xone-navy p-8 text-xone-light shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-light/70">Pre-home intro</p><img src={content.logoSrc} alt={content.logoAlt} className="mt-6 h-10 w-auto" /><ol className="mt-8 grid gap-3 text-lg font-medium sm:grid-cols-3">{content.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol><div className="mt-8 grid gap-3 sm:grid-cols-2">{content.reasons.map((reason) => <div key={reason.title}><h3 className="font-semibold">{reason.title}</h3><p className="text-sm text-xone-light/70">{reason.description}</p></div>)}</div><p className="mt-8 text-sm font-semibold text-xone-light/80">{content.ctaLabel}</p></section>;
}

function AboutBlock({ block }: { block: CmsBlock }): React.ReactNode {
  if (block.type === "hero") return <header className="mb-12 text-center"><img src={block.imageSrc ?? "/assets/XONE/xone_brand_kit/xone_logo.svg"} alt={block.imageAlt ?? BRAND_NAME} className="mx-auto mb-6 h-12 w-auto" width={200} height={48} /><h1 className="text-3xl font-bold text-foreground sm:text-5xl">{block.heading}</h1><p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">{block.body}</p></header>;
  if (block.type === "text") return <section className="mb-12 rounded-2xl bg-xone-card p-6 shadow-sm sm:p-10"><h2 className="mb-4 text-2xl font-semibold text-foreground">{block.heading}</h2>{block.paragraphs.map((paragraph, index) => <p key={`${block.id}-${index}`} className={index === 0 ? "mb-4 leading-relaxed text-muted-foreground" : "leading-relaxed text-muted-foreground"}>{paragraph}</p>)}</section>;
  if (block.type === "cards") return <section className="mb-12"><h2 className="mb-6 text-center text-2xl font-semibold text-foreground">{block.heading}</h2><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{block.items.map((item) => <article key={item.title} className="rounded-xl border border-border bg-xone-light p-6"><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-4 text-muted-foreground">{item.description}</p></article>)}</div></section>;
  if (block.type === "cta") return <section className="rounded-2xl bg-xone-accent-muted p-6 text-center sm:p-10"><h2 className="mb-3 text-2xl font-semibold text-foreground">{block.heading}</h2><p className="mb-6 text-muted-foreground">{block.body}</p><div className="flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href={block.href} className={cn(buttonVariants({ size: "lg" }))}>{block.label}</Link>{block.secondaryLabel && block.secondaryHref && <Link href={block.secondaryHref} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>{block.secondaryLabel}</Link>}</div></section>;
  return <CmsPageRenderer blocks={[block]} />;
}

function ProjectsBlock({ block }: { block: CmsBlock }): React.ReactNode {
  if (block.type === "hero") return <header className="mb-8 max-w-2xl sm:mb-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">{block.eyebrow ?? "Portfolio"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{block.heading}</h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{block.body}</p>{block.ctaLabel && block.ctaHref && <a href={block.ctaHref} className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex gap-2")}><Mail className="size-4" aria-hidden />{block.ctaLabel}</a>}</header>;
  if (block.type === "projectCollection") return <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden"><ProjectsCarousel items={block.items.map(toProject)} /></div>;
  if (block.type === "cta") return <aside className="mt-12 border-t border-border pt-10 text-center sm:text-left"><h2 className="text-xl font-semibold text-foreground">{block.heading}</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:mx-0">{block.body}</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-start"><a href={block.href} className={buttonVariants({ size: "lg" })}>{block.label}</a>{block.secondaryLabel && block.secondaryHref && <Link href={block.secondaryHref} className={buttonVariants({ variant: "outline", size: "lg" })}>{block.secondaryLabel}</Link>}</div></aside>;
  return <CmsPageRenderer blocks={[block]} />;
}

function PrehomePage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const preflight = findBlock(blocks, "preflight");
  return <>{preflight?.visible !== false && preflight && <PreFlightIntro content={preflight} />}<ExtraBlocks blocks={blocks} used={[preflight]} /></>;
}

function HomePage({ blocks, prehomeBlocks }: { blocks: readonly CmsBlock[]; prehomeBlocks: readonly CmsBlock[] }): React.ReactNode {
  const preflight = findBlock(prehomeBlocks, "preflight");
  const legacyPreflight = findBlock(blocks, "preflight");
  const hero = findBlock(blocks, "hero");
  const projects = findBlock(blocks, "projectCollection");
  const team = findBlock(blocks, "teamCollection");
  const cta = findBlock(blocks, "cta");
  return <>
    {preflight?.visible !== false && preflight && <PreFlightIntro content={preflight} />}
    {hero?.visible !== false && hero && <HomeHero content={hero} />}
    {projects?.visible !== false && projects && <FeaturedProjectsSection content={{ heading: projects.heading, body: projects.body, projects: projects.items.map(toProject) }} />}
    {team?.visible !== false && team && <TeamStripSection content={{ heading: team.heading, body: team.body, members: team.items.map(toTeamMember) }} />}
    {cta?.visible !== false && cta && <HomeCtaSection content={cta} />}
    <ExtraBlocks blocks={blocks} used={[legacyPreflight, hero, projects, team, cta]} />
  </>;
}

function ServicesPage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const block = findBlock(blocks, "serviceCollection");
  if (!block) return <CmsPageRenderer blocks={blocks} />;
  return <><ServicesPageContent content={{ heading: block.heading, body: block.body, items: block.items.map((item) => ({ id: item.title, title: item.title, description: item.description, highlights: item.highlights, icon: typeof item.icon === "string" ? serviceIcons[item.icon] : serviceIcons.cog })) }} /><ExtraBlocks blocks={blocks} used={[block]} /></>;
}

function AboutPage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const hero = findBlock(blocks, "hero");
  const story = findBlock(blocks, "text");
  const values = findBlock(blocks, "cards");
  const cta = findBlock(blocks, "cta");
  return <><AboutPageContent content={{ heading: hero?.heading, intro: hero?.body, logoSrc: hero?.imageSrc, logoAlt: hero?.imageAlt, storyHeading: story?.heading, storyParagraphs: story?.paragraphs, values: values?.items.map((item) => ({ title: item.title, description: item.description })), ctaHeading: cta?.heading, ctaBody: cta?.body, processLabel: cta?.label, contactLabel: cta?.secondaryLabel }} /><ExtraBlocks blocks={blocks} used={[hero, story, values, cta]} /></>;
}

function ProcessPage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const block = findBlock(blocks, "processCollection");
  if (!block) return <CmsPageRenderer blocks={blocks} />;
  return <><ProcessPageContent content={{ heading: block.heading, body: block.body, items: block.items.map((item) => ({ step: item.step, title: item.title, summary: item.description, details: item.details })) }} /><ExtraBlocks blocks={blocks} used={[block]} /></>;
}

function ProjectsPage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const hero = findBlock(blocks, "hero");
  const collection = findBlock(blocks, "projectCollection");
  const cta = findBlock(blocks, "cta");
  return <><ProjectsPageContent content={{ eyebrow: hero?.eyebrow, heading: hero?.heading, body: hero?.body, emailLabel: hero?.ctaLabel, emailHref: hero?.ctaHref, projects: collection?.items.map(toProject), asideHeading: cta?.heading, asideBody: cta?.body, asidePrimaryLabel: cta?.label, asidePrimaryHref: cta?.href, asideSecondaryLabel: cta?.secondaryLabel, asideSecondaryHref: cta?.secondaryHref }} /><ExtraBlocks blocks={blocks} used={[hero, collection, cta]} /></>;
}

function ContactPage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const block = findBlock(blocks, "contact");
  if (!block) return <CmsPageRenderer blocks={blocks} />;
  return <><ContactPageContent content={block} /><ExtraBlocks blocks={blocks} used={[block]} /></>;
}

function LegalPage({ blocks, kind }: { blocks: readonly CmsBlock[]; kind: "privacy" | "terms" }): React.ReactNode {
  const block = findBlock(blocks, "legal");
  if (!block) return kind === "privacy" ? <PrivacyPageContent /> : <TermsPageContent />;
  const content: LegalPageContent = { title: block.title, lastUpdated: block.lastUpdated, intro: block.intro, sections: block.sections };
  return <><LegalPageLayout {...content} /><ExtraBlocks blocks={blocks} used={[block]} /></>;
}

function ExtraBlocks({ blocks, used }: { blocks: readonly CmsBlock[]; used: readonly (CmsBlock | undefined)[] }): React.ReactNode {
  const usedIds = new Set(used.filter((block): block is CmsBlock => Boolean(block)).map((block) => block.id));
  const extra = blocks.filter((block) => !usedIds.has(block.id));
  return extra.length ? <CmsPageRenderer blocks={extra} /> : null;
}

function findBlock<T extends CmsBlock["type"]>(blocks: readonly CmsBlock[], type: T): Extract<CmsBlock, { type: T }> | undefined {
  return blocks.find((block): block is Extract<CmsBlock, { type: T }> => block.type === type);
}

function toProject(item: Extract<CmsBlock, { type: "projectCollection" }>["items"][number]): Project {
  return {
    id: item.id, title: item.title, summary: item.summary ?? item.description, mobileSummary: item.mobileSummary,
    challenge: item.challenge, outcomes: item.outcomes, category: item.category, leadEngineer: item.leadEngineer || undefined,
    teamCredits: item.teamCredits, href: item.href, liveHref: item.liveHref, liveLinkLabel: item.liveLinkLabel,
    previewImageSrc: item.image?.source === "upload" ? item.image.src : item.previewImageSrc ?? item.imageSrc, tags: item.tags,
  };
}

function toTeamMember(item: Extract<CmsBlock, { type: "teamCollection" }>["items"][number]): TeamMember {
  return {
    name: item.name, role: item.role, initials: item.initials,
    photoSrc: item.photo?.source === "upload" ? item.photo.src : item.photoSrc,
    linkedin: item.linkedin, github: item.github, portfolio: item.portfolio,
  };
}
