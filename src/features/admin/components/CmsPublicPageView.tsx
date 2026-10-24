"use client";

/* eslint-disable @next/next/no-img-element -- CMS image URLs are validated before rendering. */
import React from "react";
import Link from "next/link";
import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import type {
  CmsBlock,
  CmsBuilderElement,
  CmsBuilderSection,
  PageKey,
  SiteContent,
} from "@/features/admin/lib/content";
import { RestoredPublicPage } from "@/features/admin/components/RestoredPublicPage";
import { responsiveCss } from "../lib/design";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import Image from "next/image";
import { HomeHero } from "@/features/home/components/HomeHero";
import { FeaturedProjectsSection } from "@/features/home/components/FeaturedProjectsSection";
import { HomeCtaSection } from "@/features/home/components/HomeCtaSection";
import { PreFlightIntro } from "@/features/preflight/components/PreFlightIntro";
import { ServicesPageContent } from "@/features/services/components/ServicesPageContent";
import { serviceOfferings } from "@/features/services/data/services";
import { ProcessPageContent } from "@/features/process/components/ProcessPageContent";
import { ProjectsCarousel } from "@/features/projects/components/ProjectsCarousel";
import { ContactPageContent } from "@/features/contact/components/ContactPageContent";
import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import type { Project } from "@/features/projects/data/projects";
import { BRAND_NAME } from "@/lib/brand";

type PublicPage = Exclude<PageKey, "footer">;

const serviceIcons = {
  cog: serviceOfferings[0].icon,
  palette: serviceOfferings[1].icon,
  globe: serviceOfferings[2].icon,
  mobile: serviceOfferings[3].icon,
} as const;

export function CmsPublicPageContent({
  content,
  page,
  editing = false,
  defaultRenderer = false,
}: {
  content: SiteContent;
  page: PublicPage;
  editing?: boolean;
  defaultRenderer?: boolean;
}): React.ReactNode {
  if (defaultRenderer && !editing)
    return (
      <div className="cms-page min-h-full w-full">
        <RestoredPublicPage page={page} />
      </div>
    );
  return <CmsPublicBuilder content={content} page={page} editing={editing} />;
}
export function getCmsPublicSections(
  content: SiteContent,
  page: PublicPage,
  editing: boolean,
): readonly CmsBuilderSection[] {
  return content.pages[page].sections.filter(
    (section) => editing || section.visible,
  );
}

function CmsPublicBuilder({
  content,
  page,
  editing,
}: {
  content: SiteContent;
  page: PublicPage;
  editing: boolean;
}): React.ReactNode {
  const sections = getCmsPublicSections(content, page, editing);
  const frame =
    page === "about"
      ? "bg-xone-section px-4 py-12 sm:px-6 lg:px-8"
      : page === "projects"
        ? "bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        : "";
  const inner =
    page === "about"
      ? "mx-auto w-full max-w-5xl"
      : page === "projects"
        ? "mx-auto w-full max-w-6xl"
        : "";
  return (
    <div className="cms-page min-h-full w-full">
      <div className={frame}>
        <div className={inner}>
          {sections.map((section) => (
            <PublicSection
              key={section.id}
              section={section}
              page={page}
              editing={editing}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PublicSection({
  section,
  page,
  editing,
}: {
  section: CmsBuilderSection;
  page: PublicPage;
  editing: boolean;
}): React.ReactNode {
  return (
    <section
      data-cms-id={section.id}
      data-cms-kind="section"
      className={`cms-node ${!section.visible ? "cms-hidden" : ""}`}
    >
      <style>{responsiveCss(section.id, section.styles)}</style>
      {section.rows.map((row) => (
        <div
          key={row.id}
          data-cms-id={row.id}
          data-cms-kind="row"
          className={`cms-node grid gap-6 ${row.columns.length === 1 ? "grid-cols-1" : row.columns.length === 2 ? "grid-cols-1 md:grid-cols-2" : row.columns.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"}`}
        >
          <style>{responsiveCss(row.id, row.styles)}</style>
          {row.columns.map((column) => (
            <div
              key={column.id}
              data-cms-id={column.id}
              data-cms-kind="column"
              className="cms-node min-w-0"
            >
              <style>{responsiveCss(column.id, column.styles)}</style>
              {column.elements.map((element) => (
                <div
                  key={element.id}
                  data-cms-id={element.id}
                  data-cms-kind="element"
                  className={`cms-node ${element.type === "block" && !element.block.visible ? "cms-hidden" : ""}`}
                >
                  <style>{responsiveCss(element.id, element.styles)}</style>
                  <PublicElement
                    element={element}
                    page={page}
                    editing={editing}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function PublicElement({
  element,
  page,
  editing,
}: {
  element: CmsBuilderElement;
  page: PublicPage;
  editing: boolean;
}): React.ReactNode {
  if (element.type === "block")
    return <PublicBlock page={page} block={element.block} editing={editing} />;
  if (element.type === "text")
    return (
      <p className="break-words leading-relaxed text-muted-foreground">
        {element.text}
      </p>
    );
  if (element.type === "heading") {
    const Tag = element.level;
    return (
      <Tag
        className="break-words font-semibold"
        style={{ fontSize: "var(--cms-size, 1.5rem)" }}
      >
        {element.text}
      </Tag>
    );
  }
  if (element.type === "image")
    return (
      <img
        src={element.src}
        alt={element.alt}
        className="max-h-[32rem] w-full rounded-xl object-contain"
      />
    );
  if (element.type === "button")
    return (
      <Link
        href={element.href}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-90"
      >
        {element.label}
      </Link>
    );
  return (
    <Link
      href={element.href}
      className="font-semibold text-xone-violet underline underline-offset-4"
    >
      {element.label}
    </Link>
  );
}

function PublicBlock({
  page,
  block,
  editing,
}: {
  page: PublicPage;
  block: CmsBlock;
  editing: boolean;
}): React.ReactNode {
  if (!block.visible) return null;
  if (page === "home" || page === "prehome") {
    if (block.type === "preflight")
      return editing ? (
        <PreflightEditorPreview content={block} />
      ) : (
        <PreFlightIntro content={block} />
      );
  }
  if (page === "home") {
    if (block.type === "hero") return <HomeHero content={block} />;
    if (block.type === "projectCollection")
      return (
        <>
          <CollectionItemStyles block={block} />
          <FeaturedProjectsSection
            content={{
              eyebrow: block.eyebrow,
              heading: block.heading,
              body: block.body,
              projects: block.items.map(toProject),
            }}
            editorBlockId={block.id}
            editing={editing}
          />
        </>
      );
    if (block.type === "teamCollection") return null;
    if (block.type === "cta") return <HomeCtaSection content={block} />;
  }
  if (page === "services" && block.type === "serviceCollection")
    return (
      <>
        <CollectionItemStyles block={block} />
        <ServicesPageContent
          content={{
            heading: block.heading,
            body: block.body,
            items: block.items.map((item) => ({
              id: item.title,
              title: item.title,
              description: item.description,
              highlights: item.highlights,
              icon:
                typeof item.icon === "string"
                  ? serviceIcons[item.icon]
                  : serviceIcons.cog,
            })),
          }}
          editorBlockId={block.id}
          editing={editing}
        />
      </>
    );
  if (page === "about") return <AboutBlock block={block} editing={editing} />;
  if (page === "process" && block.type === "processCollection")
    return (
      <ProcessPageContent
        content={{
          heading: block.heading,
          body: block.body,
          items: block.items.map((item) => ({
            step: item.step,
            title: item.title,
            summary: item.description,
            details: item.details,
          })),
        }}
      />
    );
  if (page === "projects")
    return <ProjectsBlock block={block} editing={editing} />;
  if (page === "contact" && block.type === "contact")
    return <ContactPageContent content={block} />;
  if ((page === "privacy" || page === "terms") && block.type === "legal")
    return (
      <LegalPageLayout
        title={block.title}
        lastUpdated={block.lastUpdated}
        intro={block.intro}
        sections={block.sections}
      />
    );
  return <CmsPageRenderer blocks={[block]} />;
}

function PreflightEditorPreview({
  content,
}: {
  content: Extract<CmsBlock, { type: "preflight" }>;
}): React.ReactNode {
  return (
    <section className="rounded-2xl bg-xone-navy p-8 text-xone-light shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-light/70">
        Pre-home intro
      </p>
      <img
        src={content.logoSrc}
        alt={content.logoAlt}
        className="mt-6 h-10 w-auto"
      />
      <ol className="mt-8 grid gap-3 text-lg font-medium sm:grid-cols-3">
        {content.objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ol>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {content.reasons.map((reason) => (
          <div key={reason.title}>
            <h3 className="font-semibold">{reason.title}</h3>
            <p className="text-sm text-xone-light/70">{reason.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm font-semibold text-xone-light/80">
        {content.ctaLabel}
      </p>
    </section>
  );
}

function AboutBlock({
  block,
  editing = false,
}: {
  block: CmsBlock;
  editing?: boolean;
}): React.ReactNode {
  if (block.type === "hero")
    return (
      <header className="mb-12 text-center">
        <Image
          src={block.imageSrc ?? "/assets/XONE/xone_brand_kit/xone_logo.svg"}
          alt={block.imageAlt ?? BRAND_NAME}
          className="mx-auto mb-6 h-12 w-auto"
          width={200}
          height={48}
        />
        <h1 className="text-3xl font-bold text-foreground sm:text-5xl">
          {block.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          {block.body}
        </p>
      </header>
    );
  if (block.type === "text")
    return (
      <section className="mb-12 rounded-2xl bg-xone-card p-6 shadow-sm sm:p-10">
        <h2
          className="mb-4 font-semibold text-foreground"
          style={{ fontSize: "var(--cms-size, 1.5rem)" }}
        >
          {block.heading}
        </h2>
        {block.paragraphs.map((paragraph, index) => (
          <p
            key={`${block.id}-${index}`}
            className={
              index === 0
                ? "mb-4 leading-relaxed text-muted-foreground"
                : "leading-relaxed text-muted-foreground"
            }
          >
            {paragraph}
          </p>
        ))}
      </section>
    );
  if (block.type === "cards")
    return (
      <section className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
          {block.heading}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {block.items.map((item, index) => (
            <React.Fragment key={item.title}>
              <style>
                {responsiveCss(`${block.id}-item-${index}`, item.styles)}
              </style>
              <Card
                {...(block.id
                  ? {
                      "data-cms-id": `${block.id}-item-${index}`,
                    }
                  : {})}
                {...(editing
                  ? {
                      "data-cms-item-block": block.id,
                      "data-cms-item-index": index,
                    }
                  : {})}
                className="bg-xone-light"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </React.Fragment>
          ))}
        </div>
      </section>
    );
  if (block.type === "cta")
    return (
      <section className="rounded-2xl bg-xone-accent-muted p-6 text-center sm:p-10">
        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          {block.heading}
        </h2>
        <p className="mb-6 text-muted-foreground">{block.body}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={block.href}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {block.label}
          </Link>
          {block.secondaryLabel && block.secondaryHref && (
            <Link
              href={block.secondaryHref}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {block.secondaryLabel}
            </Link>
          )}
        </div>
      </section>
    );
  return <CmsPageRenderer blocks={[block]} />;
}

function ProjectsBlock({
  block,
  editing = false,
}: {
  block: CmsBlock;
  editing?: boolean;
}): React.ReactNode {
  if (block.type === "hero")
    return (
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">
          {block.eyebrow ?? "Portfolio"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {block.heading}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {block.body}
        </p>
        {block.ctaLabel && block.ctaHref && (
          <a
            href={block.ctaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 inline-flex gap-2",
            )}
          >
            <Mail className="size-4" aria-hidden />
            {block.ctaLabel}
          </a>
        )}
      </header>
    );
  if (block.type === "projectCollection")
    return (
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
        <>
          <CollectionItemStyles block={block} />
          <ProjectsCarousel
            items={block.items.map(toProject)}
            editorBlockId={block.id}
            editing={editing}
          />
        </>
      </div>
    );
  if (block.type === "cta")
    return (
      <aside className="mt-12 border-t border-border pt-10 text-center sm:text-left">
        <h2 className="text-xl font-semibold text-foreground">
          {block.heading}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:mx-0">
          {block.body}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-start">
          <a href={block.href} className={buttonVariants({ size: "lg" })}>
            {block.label}
          </a>
          {block.secondaryLabel && block.secondaryHref && (
            <Link
              href={block.secondaryHref}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {block.secondaryLabel}
            </Link>
          )}
        </div>
      </aside>
    );
  return <CmsPageRenderer blocks={[block]} />;
}

function CollectionItemStyles({
  block,
}: {
  block: Extract<
    CmsBlock,
    { type: "cards" | "projectCollection" | "serviceCollection" }
  >;
}): React.ReactNode {
  return block.items.map((item, index) => (
    <style key={`${block.id}-item-style-${index}`}>
      {responsiveCss(`${block.id}-item-${index}`, item.styles)}
    </style>
  ));
}

function toProject(
  item: Extract<CmsBlock, { type: "projectCollection" }>["items"][number],
): Project {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary ?? item.description,
    mobileSummary: item.mobileSummary,
    challenge: item.challenge,
    outcomes: item.outcomes,
    category: item.category,
    leadEngineer: item.leadEngineer || undefined,
    teamCredits: item.teamCredits,
    href: item.href,
    liveHref: item.liveHref,
    liveLinkLabel: item.liveLinkLabel,
    previewImageSrc:
      item.image?.source === "upload"
        ? item.image.src
        : (item.previewImageSrc ?? item.imageSrc),
    tags: item.tags,
  };
}
