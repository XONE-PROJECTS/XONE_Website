"use client";

/* eslint-disable @next/next/no-img-element -- CMS image URLs may be external and are validated before rendering. */
import React from "react";
import Link from "next/link";
import { responsiveCss } from "../lib/design";
import { buildContactMailto } from "@/lib/brand";
import {
  FaArrowRight,
  FaCheck,
  FaCog,
  FaGlobe,
  FaMobile,
  FaPalette,
  FaQuoteLeft,
  FaStar,
} from "react-icons/fa";

import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import { PreFlightIntro } from "@/features/preflight/components/PreFlightIntro";
import { ProjectsCarousel } from "@/features/projects/components/ProjectsCarousel";
import type {
  CmsBlock,
  CmsBuilderElement,
  CmsBuilderSection,
  CmsVisualAsset,
} from "@/features/admin/lib/content";

export function CmsPageRenderer({
  blocks,
  sections,
  includePreflight = true,
  editing = false,
}: {
  blocks?: readonly CmsBlock[];
  sections?: readonly CmsBuilderSection[];
  includePreflight?: boolean;
  editing?: boolean;
}) {
  const renderedSections: readonly CmsBuilderSection[] =
    sections ??
    (blocks ?? []).map((block) => ({
      id: block.id,
      label: block.type,
      visible: block.visible !== false,
      rows: [
        {
          id: block.id + "-row",
          columns: [
            {
              id: block.id + "-column",
              elements: [
                { id: block.id + "-element", type: "block" as const, block },
              ],
            },
          ],
        },
      ],
    }));
  return (
    <div className="cms-page min-h-full w-full bg-xone-section px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        {renderedSections
          .filter((section) => editing || section.visible)
          .map((section) => (
            <section
              key={section.id}
              data-cms-id={section.id}
              data-cms-kind="section"
              className={
                "cms-node space-y-8 " + (!section.visible ? "cms-hidden" : "")
              }
            >
              <style>{responsiveCss(section.id, section.styles)}</style>
              {section.rows.map((row) => (
                <div
                  key={row.id}
                  data-cms-id={row.id}
                  data-cms-kind="row"
                  className={
                    "cms-node grid gap-6 " +
                    (row.columns.length === 1
                      ? "grid-cols-1"
                      : row.columns.length === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : row.columns.length === 3
                          ? "grid-cols-1 md:grid-cols-3"
                          : "grid-cols-1 md:grid-cols-4")
                  }
                >
                  <style>{responsiveCss(row.id, row.styles)}</style>
                  {row.columns.map((column) => (
                    <div
                      key={column.id}
                      data-cms-id={column.id}
                      data-cms-kind="column"
                      className="cms-node min-w-0 space-y-8"
                    >
                      <style>{responsiveCss(column.id, column.styles)}</style>
                      {column.elements
                        .filter(
                          (element) =>
                            editing ||
                            element.type !== "block" ||
                            element.block.visible,
                        )
                        .map((element) => (
                          <div
                            key={element.id}
                            data-cms-id={element.id}
                            data-cms-kind="element"
                            className={
                              "cms-node " +
                              (element.type === "block" &&
                              !element.block.visible
                                ? "cms-hidden"
                                : "")
                            }
                          >
                            <style>
                              {responsiveCss(element.id, element.styles)}
                            </style>
                            <BuilderElement
                              element={element}
                              includePreflight={includePreflight}
                            />
                          </div>
                        ))}
                      {editing && !column.elements.length && (
                        <div className="cms-empty">Drop elements here</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
      </div>
    </div>
  );
}

function BuilderElement({
  element,
  includePreflight,
}: {
  element: CmsBuilderElement;
  includePreflight: boolean;
}) {
  if (element.type === "block")
    return includePreflight || element.block.type !== "preflight" ? (
      <Block block={element.block} />
    ) : null;
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

function gridClass(columns: number): string {
  if (columns === 1) return "grid-cols-1";
  if (columns === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

const serviceIcons = {
  cog: FaCog,
  palette: FaPalette,
  globe: FaGlobe,
  mobile: FaMobile,
} as const;

function Block({ block }: { block: CmsBlock }) {
  if (!block.visible) return null;
  if (block.type === "hero")
    return (
      <section className="overflow-hidden rounded-2xl bg-xone-card p-6 shadow-sm sm:p-12">
        <div
          className={
            block.imageSrc
              ? "grid items-center gap-8 lg:grid-cols-2"
              : undefined
          }
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-xone-accent">
              {block.eyebrow}
            </p>
            <h1 className="mt-2 max-w-4xl break-words text-4xl font-bold text-foreground sm:text-6xl">
              {block.heading}
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
              {block.body}
            </p>
            {block.ctaLabel && block.ctaHref && (
              <Link
                href={block.ctaHref}
                className="mt-7 inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-90"
              >
                {block.ctaLabel}
              </Link>
            )}
          </div>
          {block.imageSrc && (
            <img
              src={block.imageSrc}
              alt={block.imageAlt ?? ""}
              className={`max-h-[26rem] w-full rounded-xl object-${block.imageFit}`}
            />
          )}
        </div>
      </section>
    );
  if (block.type === "text")
    return (
      <section className="rounded-2xl bg-xone-card p-6 shadow-sm sm:p-10">
        {block.heading && (
          <h2
            className="mb-4 break-words font-semibold"
            style={{ fontSize: "var(--cms-size, 1.5rem)" }}
          >
            {block.heading}
          </h2>
        )}
        {block.paragraphs.map((paragraph, index) => (
          <p
            key={`${block.id}-${index}`}
            className="mb-4 break-words leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </section>
    );
  if (block.type === "cta")
    return (
      <section className="rounded-2xl bg-xone-accent-muted p-6 text-center sm:p-10">
        <h2 className="break-words text-2xl font-semibold">{block.heading}</h2>
        <p className="mx-auto mt-3 max-w-2xl break-words text-muted-foreground">
          {block.body}
        </p>
        <Link
          href={block.href}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-90"
        >
          {block.label}
        </Link>
      </section>
    );
  if (block.type === "contact")
    return (
      <section className="rounded-2xl bg-xone-card p-8 shadow-sm">
        <h1 className="break-words text-4xl font-bold">{block.heading}</h1>
        <p className="mt-4 break-words text-lg text-muted-foreground">
          {block.body}
        </p>
        <div className="mt-6 space-y-3 text-muted-foreground">
          {block.phone && (
            <p>
              <strong className="text-foreground">Phone:</strong>{" "}
              <a href={`tel:${block.phone}`} className="hover:text-xone-violet">
                {block.phone}
              </a>
            </p>
          )}
          {block.location && (
            <p>
              <strong className="text-foreground">Location:</strong>{" "}
              {block.location}
            </p>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={buildContactMailto("Project inquiry", block.email)}
            className="inline-flex min-h-11 max-w-full items-center break-all bg-primary px-5 font-medium text-primary-foreground"
          >
            Email us
          </a>
          <Link
            href={block.secondaryHref}
            className="inline-flex min-h-11 items-center border border-border px-5 font-medium"
          >
            {block.secondaryLabel}
          </Link>
        </div>
      </section>
    );
  if (block.type === "preflight") return <PreFlightIntro content={block} />;
  if (block.type === "processCollection")
    return (
      <section>
        <h1 className="mb-4 break-words text-center text-4xl font-bold">
          {block.heading}
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-center text-lg text-muted-foreground">
          {block.body}
        </p>
        <div className="grid gap-6 md:grid-cols-5">
          {block.items.map((item) => (
            <article
              key={`${block.id}-${item.step}`}
              className="rounded-xl bg-xone-card p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-xone-accent-muted text-xl font-bold text-xone-violet">
                {item.icon ? <Asset asset={item.icon} /> : item.step}
              </div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  if (block.type === "teamCollection") return null;
  if (block.type === "legal")
    return (
      <LegalPageLayout
        title={block.title}
        lastUpdated={block.lastUpdated}
        intro={block.intro}
        sections={block.sections}
      />
    );
  if (block.type === "component") return <ComponentBlock block={block} />;
  if (block.type === "cards")
    return (
      <section>
        <h2 className="mb-6 break-words text-center text-2xl font-semibold">
          {block.heading}
        </h2>
        <div className={`grid gap-6 ${gridClass(block.columns)}`}>
          {block.items.map((item, index) => {
            const imageSrc =
              item.image?.source === "upload" ? item.image.src : item.imageSrc;
            return (
              <article
                key={`${block.id}-${index}`}
                className="overflow-hidden rounded-xl bg-xone-card p-6 shadow-sm"
              >
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={
                      item.image?.source === "upload"
                        ? item.image.alt
                        : (item.imageAlt ?? "")
                    }
                    className="mb-5 aspect-video w-full rounded-lg object-cover"
                  />
                )}
                {item.icon && <Asset asset={item.icon} className="mb-4" />}
                <h3 className="break-words text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 break-words text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    );
  if (block.type === "serviceCollection")
    return (
      <section>
        <h1 className="mb-8 break-words text-center text-4xl font-bold">
          {block.heading}
        </h1>
        <div className={`grid gap-6 ${gridClass(block.columns)}`}>
          {block.items.map((item, index) => {
            const Icon =
              typeof item.icon === "string" ? serviceIcons[item.icon] : null;
            return (
              <article
                key={`${block.id}-${index}`}
                className="rounded-xl bg-xone-card p-6 shadow-sm"
              >
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-white">
                  {typeof item.icon === "string" && Icon ? (
                    <Icon className="text-2xl text-xone-violet" aria-hidden />
                  ) : typeof item.icon !== "string" ? (
                    <Asset asset={item.icon} />
                  ) : null}
                </div>
                <h2 className="break-words text-xl font-semibold">
                  {item.title}
                </h2>
                <p className="mt-3 break-words text-muted-foreground">
                  {item.description}
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {item.highlights.map((highlight, highlightIndex) => (
                    <li key={`${block.id}-${index}-${highlightIndex}`}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    );
  if (block.type === "projectCollection") {
    const items = block.items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary ?? item.description,
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
    }));
    return (
      <section aria-labelledby="featured-projects-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">
          Selected work
        </p>
        <h2
          id="featured-projects-heading"
          className="mt-2 break-words text-3xl font-bold"
        >
          {block.heading}
        </h2>
        {block.body && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{block.body}</p>
        )}
        {block.display === "carousel" ? (
          <ProjectsCarousel items={items} />
        ) : (
          <ul className={"mt-8 grid gap-5 " + gridClass(block.columns)}>
            {items.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-xl bg-xone-card shadow-sm"
              >
                {item.previewImageSrc && (
                  <img
                    src={item.previewImageSrc}
                    alt={item.title}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                  {item.href && (
                    <a
                      href={item.href}
                      className="mt-5 inline-block text-sm font-semibold text-xone-violet"
                    >
                      View project →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }
  return (
    <section className="rounded-xl bg-xone-navy p-6 text-xone-light">
      <p className="break-words">{block.description}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {block.links.map((link, index) => (
          <Link
            key={`${block.id}-${index}`}
            href={link.href}
            className="break-all underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ComponentBlock({
  block,
}: {
  block: Extract<CmsBlock, { type: "component" }>;
}) {
  if (block.componentKind === "divider")
    return <hr className="border-border" />;
  if (block.componentKind === "spacer")
    return (
      <div
        aria-hidden
        className={
          block.spacing === "compact"
            ? "h-4"
            : block.spacing === "spacious"
              ? "h-24"
              : "h-10"
        }
      />
    );
  if (block.componentKind === "image" && block.asset)
    return (
      <section className="overflow-hidden rounded-xl">
        <Asset
          asset={block.asset}
          className="h-auto max-h-[32rem] w-full object-contain"
        />
      </section>
    );
  if (block.componentKind === "buttonGroup")
    return (
      <section className="flex flex-wrap gap-3">
        <Link
          href={block.href ?? "/contact"}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 font-medium text-primary-foreground"
        >
          {block.label || "Learn more"}
          <FaArrowRight aria-hidden />
        </Link>
      </section>
    );
  if (block.componentKind === "faq")
    return (
      <section>
        <ComponentHeading block={block} />
        <div className="space-y-3">
          {block.items.map((item, index) => (
            <details
              key={`${block.id}-${index}`}
              className="rounded-xl border bg-background p-4"
            >
              <summary className="cursor-pointer font-semibold">
                {item.title}
              </summary>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
            </details>
          ))}
        </div>
      </section>
    );
  if (block.componentKind === "stats")
    return (
      <section>
        <ComponentHeading block={block} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {block.items.map((item, index) => (
            <article
              key={`${block.id}-${index}`}
              className="rounded-xl bg-xone-card p-5"
            >
              <p className="text-3xl font-bold text-xone-violet">
                {item.value}
              </p>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  return (
    <section
      style={{ textAlign: block.align }}
      className={`rounded-xl ${block.spacing === "compact" ? "p-4" : block.spacing === "spacious" ? "p-12" : "p-7"} ${block.componentKind === "alert" ? "bg-xone-accent-muted" : block.componentKind === "badge" ? "bg-transparent" : "bg-xone-card"}`}
    >
      <ComponentHeading block={block} />
      {block.icon && <Asset asset={block.icon} className="mb-4" />}
      {block.asset && block.componentKind !== "image" && (
        <Asset
          asset={block.asset}
          className="mb-5 max-h-64 w-full object-contain"
        />
      )}
      {block.body && (
        <p className="max-w-3xl text-muted-foreground">{block.body}</p>
      )}
      <div className={`mt-6 grid gap-4 ${componentGridClass(block.columns)}`}>
        {block.items.map((item, index) => (
          <article
            key={`${block.id}-${index}`}
            className="rounded-lg border bg-background/70 p-4"
          >
            <div className="flex items-start gap-3">
              {item.icon && (
                <Asset asset={item.icon} className="mt-1 shrink-0" />
              )}
              {item.image && (
                <Asset
                  asset={item.image}
                  className="size-14 shrink-0 rounded-md object-cover"
                />
              )}
              {item.value && (
                <span className="text-2xl font-bold text-xone-violet">
                  {item.value}
                </span>
              )}
              <div>
                <h3 className="font-semibold">{item.title || item.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                {item.href && (
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-xone-violet"
                  >
                    {item.label || "Learn more"}
                    <FaArrowRight aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function componentGridClass(columns: number): string {
  if (columns <= 1) return "grid-cols-1";
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

function ComponentHeading({
  block,
}: {
  block: Extract<CmsBlock, { type: "component" }>;
}) {
  return block.heading ? (
    <h2 className="mb-3 text-2xl font-semibold">{block.heading}</h2>
  ) : null;
}

function Asset({
  asset,
  className = "",
}: {
  asset: CmsVisualAsset;
  className?: string;
}) {
  const size = asset.size ?? 28;
  if (asset.source === "upload")
    return (
      <img
        src={asset.src}
        alt={asset.alt}
        width={asset.width ?? size}
        height={asset.height ?? size}
        className={className}
        style={{ width: asset.width, height: asset.height }}
      />
    );
  const Icon =
    asset.name === "check"
      ? FaCheck
      : asset.name === "arrow"
        ? FaArrowRight
        : asset.name === "quote"
          ? FaQuoteLeft
          : asset.name === "star"
            ? FaStar
            : asset.name === "globe"
              ? FaGlobe
              : asset.name === "mobile"
                ? FaMobile
                : asset.name === "palette"
                  ? FaPalette
                  : asset.name === "cog"
                    ? FaCog
                    : FaStar;
  return (
    <Icon
      aria-label={asset.label}
      className={className}
      style={{ color: asset.color ?? "currentColor", fontSize: size }}
      aria-hidden={!asset.label}
    />
  );
}
