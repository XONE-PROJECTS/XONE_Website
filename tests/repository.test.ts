import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultContent, parseSiteContent } from "@/features/admin/lib/content";

const mocks = vi.hoisted(() => {
  const site = { findOne: vi.fn(), updateOne: vi.fn() };
  const revisions = { updateOne: vi.fn(), find: vi.fn(), deleteMany: vi.fn() };
  const database = { collection: vi.fn((name: string) => name === "site_content" ? site : revisions) };
  return { site, revisions, database, getMongoDatabase: vi.fn(async () => database) };
});

vi.mock("@/lib/mongodb", () => ({ getMongoDatabase: mocks.getMongoDatabase }));

import { CmsConflictError, CmsStorageError, CURRENT_CONTENT_VERSION, getContentState, getPublishedContent, saveDraft } from "@/features/admin/lib/repository";

function document(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    _id: "site",
    version: CURRENT_CONTENT_VERSION,
    revision: 4,
    draft: structuredClone(defaultContent),
    published: structuredClone(defaultContent),
    updatedAt: new Date(),
    publishedAt: null,
    ...overrides,
  };
}

describe("CMS repository migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MONGODB_URI = "mongodb://test";
    mocks.site.updateOne.mockResolvedValue({ matchedCount: 1 });
    mocks.revisions.updateOne.mockResolvedValue({ matchedCount: 1 });
  });

  it("reads valid current content without migrating", async () => {
    mocks.site.findOne.mockResolvedValue(document());

    const state = await getContentState();

    expect(state.revision).toBe(4);
    expect(mocks.site.updateOne).not.toHaveBeenCalled();
    expect(mocks.revisions.updateOne).not.toHaveBeenCalled();
  });

  it("backs up and resets older content to the public baseline", async () => {
    const legacy = document({ version: CURRENT_CONTENT_VERSION - 1 });
    mocks.site.findOne.mockResolvedValue(legacy);
    const baseline = parseSiteContent(defaultContent);

    const state = await getContentState();

    expect(state.revision).toBe(5);
    expect(mocks.revisions.updateOne).toHaveBeenCalledTimes(2);
    expect(mocks.revisions.updateOne.mock.calls[0]?.[1]).toMatchObject({ $setOnInsert: { content: legacy.draft } });
    expect(mocks.revisions.updateOne.mock.calls[1]?.[1]).toMatchObject({ $setOnInsert: { content: legacy.published } });
    expect(mocks.site.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ version: CURRENT_CONTENT_VERSION - 1, revision: 4 }),
      expect.objectContaining({ $set: expect.objectContaining({ version: CURRENT_CONTENT_VERSION, revision: 5, draft: baseline, published: baseline }) }),
    );
  });

  it("repairs current-version content that fails schema validation", async () => {
    const invalid = structuredClone(defaultContent);
    const hero = invalid.pages.home.blocks.find(block => block.type === "hero");
    if (!hero || hero.type !== "hero") throw new Error("Expected home hero block");
    hero.ctaHref = "javascript:alert(1)";
    const stored = document({ draft: invalid, published: invalid });
    mocks.site.findOne.mockResolvedValue(stored);

    const state = await getContentState();

    expect(state.draft.pages.home.blocks[0]).toMatchObject({ id: "home-hero", type: "hero" });
    expect(mocks.site.updateOne).toHaveBeenCalledTimes(1);
    expect(mocks.revisions.updateOne).toHaveBeenCalledTimes(2);
  });

  it("rejects unsupported future versions", async () => {
    mocks.site.findOne.mockResolvedValue(document({ version: CURRENT_CONTENT_VERSION + 1 }));

    await expect(getContentState()).rejects.toBeInstanceOf(CmsStorageError);
    expect(mocks.site.updateOne).not.toHaveBeenCalled();
  });

  it("serves the baseline when public CMS content is unreadable", async () => {
    mocks.site.findOne.mockResolvedValue(document({ version: CURRENT_CONTENT_VERSION + 1 }));

    const content = await getPublishedContent();

    expect(content.pages.home.blocks[0]).toMatchObject({ id: "home-hero", type: "hero" });
  });

  it("keeps revision conflicts protected", async () => {
    mocks.site.findOne.mockResolvedValue(document({ revision: 8 }));

    await expect(saveDraft(structuredClone(defaultContent), 7, "test@example.com", true)).rejects.toBeInstanceOf(CmsConflictError);
    expect(mocks.site.updateOne).not.toHaveBeenCalled();
  });
});
