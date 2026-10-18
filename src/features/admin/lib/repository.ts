import { getMongoDatabase } from "@/lib/mongodb";
import { defaultContent, parseSiteContent, type SiteContent } from "@/features/admin/lib/content";

export const CURRENT_CONTENT_VERSION = 8;
type ContentDocument = { _id: "site"; version?: number; draft: SiteContent; published: SiteContent; updatedAt: Date; publishedAt: Date | null };

const collectionName = "site_content";

export async function getContentState(): Promise<{ draft: SiteContent; published: SiteContent }> {
  const db = await getMongoDatabase();
  const document = await db.collection<ContentDocument>(collectionName).findOne({ _id: "site" });
  if (!document || document.version !== CURRENT_CONTENT_VERSION) return { draft: defaultContent, published: defaultContent };
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
  const content = current?.version === CURRENT_CONTENT_VERSION ? parseSiteContent(current.draft) : defaultContent;
  const now = new Date();
  await db.collection<ContentDocument>(collectionName).updateOne(
    { _id: "site" },
    { $set: { version: CURRENT_CONTENT_VERSION, draft: content, published: content, updatedAt: now, publishedAt: now } },
    { upsert: true },
  );
  return content;
}

export async function getPublishedContent(): Promise<SiteContent> {
  if (process.env.NEXT_PHASE === "phase-production-build") return defaultContent;
  try {
    return (await getContentState()).published;
  } catch {
    return defaultContent;
  }
}
