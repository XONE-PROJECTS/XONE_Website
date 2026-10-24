import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import type { CmsBlock, PageKey, SiteContent } from "@/features/admin/lib/content";
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
import { ContactPageContent } from "@/features/contact/components/ContactPageContent";
import { PrivacyPageContent } from "@/features/legal/components/PrivacyPageContent";
import { TermsPageContent } from "@/features/legal/components/TermsPageContent";
import { LegalPageLayout, type LegalPageContent } from "@/features/legal/components/LegalPageLayout";
import type { Project } from "@/features/projects/data/projects";
import type { TeamMember } from "@/lib/team-members";

type PublicPage = Exclude<PageKey, "footer">;

const serviceIcons = {
  cog: serviceOfferings[0].icon,
  palette: serviceOfferings[1].icon,
  globe: serviceOfferings[2].icon,
  mobile: serviceOfferings[3].icon,
} as const;

export function CmsPublicPageContent({ content, page }: { content: SiteContent; page: PublicPage }): React.ReactNode {
  const blocks = content.pages[page].blocks;
  switch (page) {
    case "home": return <HomePage blocks={blocks} />;
    case "services": return <ServicesPage blocks={blocks} />;
    case "about": return <AboutPage blocks={blocks} />;
    case "process": return <ProcessPage blocks={blocks} />;
    case "projects": return <ProjectsPage blocks={blocks} />;
    case "contact": return <ContactPage blocks={blocks} />;
    case "privacy": return <LegalPage blocks={blocks} kind="privacy" />;
    case "terms": return <LegalPage blocks={blocks} kind="terms" />;
  }
}

function HomePage({ blocks }: { blocks: readonly CmsBlock[] }): React.ReactNode {
  const preflight = findBlock(blocks, "preflight");
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
    <ExtraBlocks blocks={blocks} used={[preflight, hero, projects, team, cta]} />
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
