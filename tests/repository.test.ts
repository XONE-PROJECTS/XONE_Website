import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultContent, parseSiteContent } from "@/features/admin/lib/content";

const mocks = vi.hoisted(() => {
  const site = { findOne: vi.fn(), updateOne: vi.fn() };
  const revisions = {
    updateOne: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    deleteMany: vi.fn(),
  };
  const database = {
    collection: vi.fn((name: string) =>
      name === "site_content" ? site : revisions,
    ),
  };
  return {
    site,
    revisions,
    database,
    getMongoDatabase: vi.fn(async () => database),
  };
});

vi.mock("@/lib/mongodb", () => ({ getMongoDatabase: mocks.getMongoDatabase }));

import {
  CmsConflictError,
  CmsStorageError,
  CURRENT_CONTENT_VERSION,
  getContentState,
  getPublishedContent,
  saveDraft,
  publishDraft,
  restoreRevision,
} from "@/features/admin/lib/repository";

function document(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
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

  it("serves the default content with no stored site document", async () => {
    mocks.site.findOne.mockResolvedValue(null);

    const state = await getContentState();

    expect(state).toEqual({
      draft: parseSiteContent(defaultContent),
      published: parseSiteContent(defaultContent),
      revision: 0,
    });
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
    expect(mocks.revisions.updateOne.mock.calls[0]?.[1]).toMatchObject({
      $setOnInsert: { content: legacy.draft },
    });
    expect(mocks.revisions.updateOne.mock.calls[1]?.[1]).toMatchObject({
      $setOnInsert: { content: legacy.published },
    });
    expect(mocks.site.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        version: CURRENT_CONTENT_VERSION - 1,
        revision: 4,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          version: CURRENT_CONTENT_VERSION,
          revision: 5,
          draft: baseline,
          published: baseline,
        }),
      }),
    );
  });

  it("repairs current-version content that fails schema validation", async () => {
    const invalid = structuredClone(defaultContent);
    const hero = invalid.pages.home.blocks.find(
      (block) => block.type === "hero",
    );
    if (!hero || hero.type !== "hero")
      throw new Error("Expected home hero block");
    hero.ctaHref = "javascript:alert(1)";
    const stored = document({ draft: invalid, published: invalid });
    mocks.site.findOne.mockResolvedValue(stored);

    const state = await getContentState();

    expect(state.draft.pages.home.blocks[0]).toMatchObject({
      id: "home-hero",
      type: "hero",
    });
    expect(mocks.site.updateOne).toHaveBeenCalledTimes(1);
    expect(mocks.revisions.updateOne).toHaveBeenCalledTimes(2);
  });

  it("rejects unsupported future versions", async () => {
    mocks.site.findOne.mockResolvedValue(
      document({ version: CURRENT_CONTENT_VERSION + 1 }),
    );

    await expect(getContentState()).rejects.toBeInstanceOf(CmsStorageError);
    expect(mocks.site.updateOne).not.toHaveBeenCalled();
  });

  it("serves the baseline when public CMS content is unreadable", async () => {
    mocks.site.findOne.mockResolvedValue(
      document({ version: CURRENT_CONTENT_VERSION + 1 }),
    );

    const content = await getPublishedContent();

    expect(content.pages.home.blocks[0]).toMatchObject({
      id: "home-hero",
      type: "hero",
    });
  });

  it("keeps revision conflicts protected", async () => {
    mocks.site.findOne.mockResolvedValue(document({ revision: 8 }));

    await expect(
      saveDraft(structuredClone(defaultContent), 7, "test@example.com", true),
    ).rejects.toBeInstanceOf(CmsConflictError);
    expect(mocks.site.updateOne).not.toHaveBeenCalled();
  });

  it("keeps pricing in draft until publish and publishes the same catalog", async () => {
    const content = parseSiteContent(defaultContent);
    content.projectEstimator.systems[0].priceCents = 999_900;
    mocks.site.findOne.mockResolvedValue(document());
    const saved = await saveDraft(content, 4, "admin@example.com", true);
    expect(saved.draft.projectEstimator.systems[0].priceCents).toBe(999_900);
    expect(saved.published.projectEstimator.systems[0].priceCents).toBe(
      1_200_000,
    );
    expect(saved.published.pages).toEqual(
      parseSiteContent(defaultContent).pages,
    );

    mocks.site.findOne.mockResolvedValue(
      document({ draft: content, revision: saved.revision }),
    );
    const published = await publishDraft(saved.revision, "admin@example.com");
    expect(published.published.projectEstimator).toEqual(
      content.projectEstimator,
    );
    expect(published.published.pages).toEqual(saved.published.pages);
  });

  it("restores historic pricing to draft while preserving the published catalog", async () => {
    const historical = parseSiteContent(defaultContent);
    historical.projectEstimator.systems[0].priceCents = 800_000;
    mocks.site.findOne.mockResolvedValue(document());
    mocks.revisions.findOne.mockResolvedValue({
      _id: "pricing-history",
      content: historical,
    });
    const restored = await restoreRevision(
      "pricing-history",
      4,
      "admin@example.com",
    );
    expect(restored?.draft.projectEstimator.systems[0].priceCents).toBe(
      800_000,
    );
    expect(restored?.published.projectEstimator.systems[0].priceCents).toBe(
      1_200_000,
    );
  });

  it("defaults pricing on pre-estimator documents without a migration or page reset", async () => {
    const legacy: Partial<typeof defaultContent> =
      structuredClone(defaultContent);
    delete legacy.projectEstimator;
    mocks.site.findOne.mockResolvedValue(
      document({ draft: legacy, published: legacy }),
    );
    const state = await getContentState();
    expect(state.draft.projectEstimator.systems).toHaveLength(33);
    expect(mocks.site.updateOne).not.toHaveBeenCalled();
  });
});
