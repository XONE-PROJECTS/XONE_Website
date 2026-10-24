import { describe, expect, it } from "vitest";

import { defaultContent, pageKeys, parseSiteContent, siteContentSchema } from "@/features/admin/lib/content";

describe("admin content schema", () => {
  it("accepts the built-in typed content", () => {
    expect(parseSiteContent(defaultContent)).toMatchObject(defaultContent);
  });

  it("includes the restored public-page blocks", () => {
    const content = parseSiteContent(defaultContent);
    expect(content.pages.prehome.blocks[0]).toMatchObject({
      type: "preflight",
      objectives: expect.arrayContaining([
        "Partner transparently from discovery through launch",
      ]),
    });
    expect(content.pages.process.blocks[0].type).toBe("processCollection");
    expect(content.pages.contact.blocks[0]).toMatchObject({
      type: "contact",
      phone: expect.any(String),
      location: expect.any(String),
    });
    expect(content.pages.home.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "teamCollection" }),
      ]),
    );
    expect(content.pages.privacy.blocks[0].type).toBe("legal");
    expect(content.pages.projects.blocks[1]).toMatchObject({
      type: "projectCollection",
      display: "carousel",
    });
  });

  it("matches the current public-page baseline", () => {
    const content = parseSiteContent(defaultContent);
    for (const page of pageKeys) expect(content.pages[page].blocks.length).toBeGreaterThan(0);

    expect(content.pages.prehome.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "prehome-preflight", type: "preflight" }),
    ]));
    expect(content.pages.home.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "home-hero", type: "hero" }),
      expect.objectContaining({ id: "home-projects", type: "projectCollection" }),
      expect.objectContaining({ id: "home-team", type: "teamCollection" }),
      expect.objectContaining({ id: "home-cta", type: "cta" }),
    ]));
    expect(content.pages.projects.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "projects-hero", type: "hero", eyebrow: "Portfolio" }),
      expect.objectContaining({ id: "projects-list", type: "projectCollection", display: "carousel", items: expect.arrayContaining([expect.objectContaining({ id: "rahamen-digital-base44" })]) }),
      expect.objectContaining({ id: "projects-cta", type: "cta", secondaryHref: "/contact" }),
    ]));
    expect(content.pages.services.blocks[0]).toMatchObject({ type: "serviceCollection", body: expect.stringContaining("end-to-end") });
    expect(content.pages.process.blocks[0]).toMatchObject({ type: "processCollection", items: expect.arrayContaining([expect.objectContaining({ details: expect.arrayContaining(["Discovery workshops to align on business objectives"]) })]) });
    expect(content.pages.contact.blocks[0]).toMatchObject({ type: "contact", detailsHeading: "Get in touch", phoneDisplay: "09533720594", note: expect.stringContaining("Online contact forms") });
    expect(content.pages.privacy.blocks[0]).toMatchObject({ type: "legal", sections: expect.arrayContaining([expect.objectContaining({ id: "cookies" })]) });
    expect(content.pages.terms.blocks[0]).toMatchObject({ type: "legal", sections: expect.arrayContaining([expect.objectContaining({ id: "limitation-of-liability" })]) });
    expect(content.pages.footer.blocks[0]).toMatchObject({ type: "footer", serviceLinks: expect.arrayContaining([expect.objectContaining({ label: "Web & Mobile Apps" })]), companyLinks: expect.arrayContaining([expect.objectContaining({ label: "Contact" })]) });
  });

  it("ignores legacy custom pages while retaining fixed public pages", () => {
    const legacy = {
      ...defaultContent,
      customPages: { legacy: { blocks: [], sections: [], seo: { title: "Legacy", description: "", noIndex: false } } },
      customPageDefinitions: [{ id: "legacy", name: "Legacy", slug: "legacy", description: "", archived: false }],
    };
    const parsed = parseSiteContent(legacy);
    expect(parsed.pages.home.blocks).toHaveLength(defaultContent.pages.home.blocks.length);
    expect(parsed).not.toHaveProperty("customPages");
    expect(parsed).not.toHaveProperty("customPageDefinitions");
  });

  it("moves legacy home preflight content into the dedicated pre-home page", () => {
    const legacy = structuredClone(defaultContent);
    const preflight = legacy.pages.prehome.blocks[0];
    legacy.pages.home.blocks.unshift(preflight);
    delete (legacy.pages as Partial<typeof legacy.pages>).prehome;

    const parsed = parseSiteContent(legacy);
    expect(parsed.pages.prehome.blocks[0]).toMatchObject({ id: preflight.id, type: "preflight" });
    expect(parsed.pages.home.blocks).not.toEqual(expect.arrayContaining([expect.objectContaining({ type: "preflight" })]));
  });

  it("rejects unsafe or malformed blocks", () => {
    const invalid = structuredClone(defaultContent);
    invalid.pages.home.blocks[0] = {
      id: "unsafe",
      type: "hero",
      heading: "Bad link",
      body: "content",
      ctaLabel: "Open",
      ctaHref: "javascript:alert(1)",
      imageFit: "cover",
      columns: 1,
      visible: true,
    };
    expect(siteContentSchema.safeParse(invalid).success).toBe(false);
  });

  it("accepts named components and editable visual assets", () => {
    const content = structuredClone(defaultContent);
    content.pages.home.blocks.push({
      id: "component-test",
      type: "component",
      componentKind: "logoStrip",
      heading: "Trusted by teams",
      body: "",
      label: "",
      items: [],
      columns: 3,
      align: "center",
      spacing: "default",
      icon: {
        source: "library",
        name: "star",
        color: "#22d3ee",
        size: 32,
        variant: "outline",
      },
      visible: true,
    });
    expect(parseSiteContent(content).pages.home.blocks.at(-1)).toMatchObject({
      type: "component",
      componentKind: "logoStrip",
      icon: { source: "library", color: "#22d3ee", size: 32 },
    });
  });

  it("rejects invalid visual asset values", () => {
    const content = structuredClone(defaultContent);
    content.pages.home.blocks.push({
      id: "invalid-component",
      type: "component",
      componentKind: "badge",
      heading: "Badge",
      body: "",
      label: "",
      items: [],
      columns: 3,
      align: "left",
      spacing: "default",
      icon: { source: "library", name: "star", color: "not-a-color", size: 1, variant: "solid" },
      visible: true,
    });
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });

  it("accepts per-item media while preserving legacy item shapes", () => {
    const content = structuredClone(defaultContent);
    const cards = content.pages.about.blocks.find((block) => block.type === "cards");
    const team = content.pages.home.blocks.find((block) => block.type === "teamCollection");
    const process = content.pages.process.blocks.find((block) => block.type === "processCollection");
    const projects = content.pages.projects.blocks.find((block) => block.type === "projectCollection");

    if (!cards || cards.type !== "cards" || !team || team.type !== "teamCollection" || !process || process.type !== "processCollection" || !projects || projects.type !== "projectCollection") {
      throw new Error("Expected default collection blocks");
    }

    cards.items[0].image = { source: "upload", assetId: "asset-card", src: "/api/admin/media/asset-card", alt: "Card image" };
    cards.items[0].icon = { source: "library", name: "star", variant: "solid" };
    team.items[0].photo = { source: "upload", assetId: "asset-member", src: "/api/admin/media/asset-member", alt: "Member photo" };
    process.items[0].icon = { source: "library", name: "check", variant: "outline" };
    projects.items[0].image = { source: "upload", assetId: "asset-project", src: "/api/admin/media/asset-project", alt: "Project preview" };

    const parsed = parseSiteContent(content);
    expect(parsed.pages.about.blocks[2]).toMatchObject({ type: "cards" });
    expect((parsed.pages.about.blocks[2] as Extract<typeof parsed.pages.about.blocks[number], { type: "cards" }>).items[0]).toMatchObject({ image: { assetId: "asset-card" }, icon: { name: "star" } });
    const parsedTeam = parsed.pages.home.blocks.find((block) => block.type === "teamCollection");
    expect(parsedTeam && parsedTeam.type === "teamCollection" ? parsedTeam.items[0].photo : undefined).toMatchObject({ assetId: "asset-member" });
    expect(parsed.pages.process.blocks[0]).toMatchObject({ items: expect.any(Array) });
    expect(parsed.pages.process.blocks[0].type === "processCollection" ? parsed.pages.process.blocks[0].items[0].icon : undefined).toMatchObject({ name: "check" });
    expect(parsed.pages.projects.blocks[1]).toMatchObject({ items: expect.any(Array) });
    expect(parsed.pages.projects.blocks[1].type === "projectCollection" ? parsed.pages.projects.blocks[1].items[0].image : undefined).toMatchObject({ assetId: "asset-project" });
  });

  it("migrates legacy flat pages into editable sections, rows, and columns", () => {
    const parsed = parseSiteContent(defaultContent);
    const section = parsed.pages.prehome.sections[0];
    expect(section.rows[0]?.columns[0]?.elements[0]).toMatchObject({
      type: "block",
      block: { id: "prehome-preflight" },
    });
  });

  it("validates links on nested builder elements", () => {
    const content = structuredClone(defaultContent);
    const parsed = parseSiteContent(content);
    parsed.pages.home.sections[0]?.rows[0]?.columns[0]?.elements.push({
      id: "unsafe-link",
      type: "button",
      label: "Unsafe",
      href: "javascript:alert(1)",
    });
    expect(siteContentSchema.safeParse(parsed).success).toBe(false);
  });
});
