import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CmsPublicPageContent,
  getCmsPublicSections,
} from "@/features/admin/components/CmsPublicPageView";
import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import { RestoredPublicPage } from "@/features/admin/components/RestoredPublicPage";
import {
  previewPageClassName,
  previewToolbarInnerClassName,
} from "@/features/admin/components/PreviewLiveSync";
import { cloneNode, replacePage } from "@/features/admin/lib/builder";
import {
  defaultContent,
  isDefaultContent,
  parseSiteContent,
} from "@/features/admin/lib/content";

describe("canonical CMS page renderer", () => {
  it("keeps the default public page order from the target site", () => {
    const content = parseSiteContent(defaultContent);
    const pages = [
      "home",
      "projects",
      "services",
      "about",
      "contact",
      "process",
      "privacy",
      "terms",
    ] as const;

    expect(
      Object.fromEntries(
        pages.map((page) => [
          page,
          content.pages[page].sections.map((section) =>
            section.rows[0]?.columns[0]?.elements[0]?.type === "block"
              ? section.rows[0].columns[0].elements[0].block.type
              : "custom",
          ),
        ]),
      ),
    ).toEqual({
      home: ["hero", "projectCollection", "cta"],
      projects: ["hero", "projectCollection", "cta"],
      services: ["serviceCollection"],
      about: ["hero", "text", "cards", "cta"],
      contact: ["contact"],
      process: ["processCollection"],
      privacy: ["legal"],
      terms: ["legal"],
    });
  });

  it("renders reordered sections in the stored order", () => {
    const content = parseSiteContent(defaultContent);
    const page = content.pages.home;
    const first = page.sections[0];
    const second = page.sections[1];
    if (!first || !second) throw new Error("Expected home sections");

    const next = replacePage(content, "home", {
      ...page,
      sections: [second, first, ...page.sections.slice(2)],
    });
    expect(
      getCmsPublicSections(next, "home", false).map((section) => section.id),
    ).toEqual([
      second.id,
      first.id,
      ...page.sections.slice(2).map((section) => section.id),
    ]);
  });

  it("renders duplicated blocks instead of collapsing them by type", () => {
    const content = parseSiteContent(defaultContent);
    const page = content.pages.home;
    const hero = page.sections[0];
    if (!hero) throw new Error("Expected home hero section");

    const duplicate = cloneNode(hero);
    const element = duplicate.rows[0]?.columns[0]?.elements[0];
    if (!element || element.type !== "block" || element.block.type !== "hero")
      throw new Error("Expected hero block");
    element.block = { ...element.block, heading: "Duplicated hero heading" };

    const next = replacePage(content, "home", {
      ...page,
      sections: [...page.sections, duplicate],
    });
    expect(
      getCmsPublicSections(next, "home", false).map((section) => section.id),
    ).toEqual([...page.sections.map((section) => section.id), duplicate.id]);
    expect(duplicate.rows[0]?.columns[0]?.elements[0]).toMatchObject({
      block: { heading: "Duplicated hero heading" },
    });
  });

  it("hides sections publicly but keeps them visible to the editor", () => {
    const content = parseSiteContent(defaultContent);
    const page = content.pages.home;
    const first = page.sections[0];
    if (!first) throw new Error("Expected home hero section");

    const next = replacePage(content, "home", {
      ...page,
      sections: page.sections.map((section) =>
        section.id === first.id ? { ...section, visible: false } : section,
      ),
    });

    expect(
      getCmsPublicSections(next, "home", false).map((section) => section.id),
    ).not.toContain(first.id);
    expect(
      getCmsPublicSections(next, "home", true).map((section) => section.id),
    ).toContain(first.id);
  });

  it("keeps pre-home editing separate from the Home editor", () => {
    const content = parseSiteContent(defaultContent);
    const homeEditor = CmsPublicPageContent({
      content,
      page: "home",
      editing: true,
    });
    const homePreview = CmsPublicPageContent({ content, page: "home" });
    const prehomeEditor = CmsPublicPageContent({
      content,
      page: "prehome",
      editing: true,
    });

    expect(homeEditor).toMatchObject({
      props: { editing: true, includePrehome: false },
    });
    expect(homePreview).toMatchObject({
      props: { editing: false, includePrehome: true },
    });
    expect(prehomeEditor).toMatchObject({
      props: { editing: true, includePrehome: false },
    });
  });

  it("uses the source page renderer for untouched default content", () => {
    const content = parseSiteContent(defaultContent);
    expect(isDefaultContent(content)).toBe(true);
    const page = CmsPublicPageContent({
      content,
      page: "home",
      defaultRenderer: true,
    }) as { type: string; props: { children: unknown } };
    const children = page.props.children as readonly {
      type: unknown;
      props?: { children?: unknown };
    }[];

    expect(page.type).toBe("div");
    expect(children).toHaveLength(2);
    expect(children[1]?.type).toBe(RestoredPublicPage);
    const sourcePage = RestoredPublicPage({ page: "home" }) as {
      props: { children: unknown };
    };
    expect(sourcePage.props.children).toHaveLength(3);
  });

  it("does not render legacy team blocks in public or CMS preview output", () => {
    const content = structuredClone(defaultContent);
    content.pages.home.blocks.push({
      id: "legacy-team",
      type: "teamCollection",
      heading: "Engineers you will work with",
      body: "Xone is a small, senior-led team — no hand-offs to anonymous contractors.",
      items: [
        { name: "Test member", role: "Engineer", initials: "TM", photoSrc: "" },
      ],
      columns: 3,
      visible: true,
    });
    content.pages.home.blocks = [content.pages.home.blocks.at(-1)!];
    const parsed = parseSiteContent(content);
    const team = parsed.pages.home.blocks.find(
      (block) => block.type === "teamCollection",
    );
    if (!team || team.type !== "teamCollection")
      throw new Error("Expected legacy team block");

    expect(
      renderToStaticMarkup(
        CmsPublicPageContent({ content: parsed, page: "home", editing: true }),
      ),
    ).not.toContain("Engineers you will work with");
    expect(
      renderToStaticMarkup(CmsPageRenderer({ blocks: [team] })),
    ).not.toContain("Engineers you will work with");
  });

  it("keeps the preview toolbar constrained while page content stays full width", () => {
    expect(previewToolbarInnerClassName).toContain("max-w-7xl");
    expect(previewPageClassName).toBe("w-full flex-1");
  });
});
