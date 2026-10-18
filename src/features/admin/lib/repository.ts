import { getMongoDatabase } from "@/lib/mongodb";
import { defaultContent, parseSiteContent, type SiteContent } from "@/features/admin/lib/content";

export const CURRENT_CONTENT_VERSION = 9;
type ContentDocument = { _id: "site"; version?: number; draft: SiteContent; published: SiteContent; updatedAt: Date; publishedAt: Date | null };

const collectionName = "site_content";

export async function getContentState(): Promise<{ draft: SiteContent; published: SiteContent }> {
  const db = await getMongoDatabase();
  const document = await db.collection<ContentDocument>(collectionName).findOne({ _id: "site" });
  if (!document || !document.version || document.version < 8 || document.version > CURRENT_CONTENT_VERSION) {
    const normalized = parseSiteContent(defaultContent);
    return { draft: normalized, published: normalized };
  }
  return { draft: parseSiteContent(document.draft), published: parseSiteContent(document.published) };
}

export async function saveDraft(content: SiteContent): Promise<void> {
  const db = await getMongoDatabase();
  const now = new Date();
  await db.collection<ContentDocument>(collectionName).updateOne(
    { _id: "site" },
    { $set: { version: CURRENT_CONTENT_VERSION, draft: content, updatedAt: now }, $setOnInsert: { published: defaultContent, publishedAt: null } },
    { upsert: true },
  );
}

export async function publishDraft(): Promise<SiteContent> {
  const db = await getMongoDatabase();
  const current = await db.collection<ContentDocument>(collectionName).findOne({ _id: "site" });
  const content = current?.version && current.version >= 8 && current.version <= CURRENT_CONTENT_VERSION ? parseSiteContent(current.draft) : parseSiteContent(defaultContent);
  const now = new Date();
  await db.collection<ContentDocument>(collectionName).updateOne(
    { _id: "site" },
    { $set: { version: CURRENT_CONTENT_VERSION, draft: content, published: content, updatedAt: now, publishedAt: now } },
    { upsert: true },
  );
  return content;
}

export async function getPublishedContent(): Promise<SiteContent> {
  if (process.env.NEXT_PHASE === "phase-production-build") return parseSiteContent(defaultContent);
  try {
    return (await getContentState()).published;
  } catch {
    return parseSiteContent(defaultContent);
  }
}
