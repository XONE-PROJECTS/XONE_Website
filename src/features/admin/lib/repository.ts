import { randomUUID } from "node:crypto";
import { MongoServerError } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";
import { defaultContent, parseSiteContent, type SiteContent } from "./content";

export const CURRENT_CONTENT_VERSION = 10;
export class CmsConflictError extends Error { constructor() { super("This draft changed in another tab. Download your edits, then reload the latest draft."); } }
export class CmsStorageError extends Error { constructor() { super("Stored CMS content could not be read safely. Restore a supported backup before saving."); } }
export type RevisionAction = "checkpoint" | "save" | "publish" | "restore";
type Snapshot = { _id: string; revision: number; content: SiteContent; createdAt: Date; author: string; action: RevisionAction };
type ContentDocument = { _id: "site"; version?: number; revision?: number; draft: SiteContent; published: SiteContent; updatedAt: Date; publishedAt: Date | null; checkpointAt?: Date; pendingSnapshot?: Snapshot };
export type ContentState = { draft: SiteContent; published: SiteContent; revision: number };
const sites = "site_content", revisions = "cms_revisions";

function read(document: ContentDocument | null): ContentState {
  if (!document) { const content = parseSiteContent(defaultContent); return { draft: content, published: content, revision: 0 }; }
  if (document.version !== undefined && (!Number.isInteger(document.version) || document.version < 1 || document.version > CURRENT_CONTENT_VERSION)) throw new CmsStorageError();
  try { return { draft: parseSiteContent(document.draft), published: parseSiteContent(document.published), revision: document.revision ?? 0 }; }
  catch { throw new CmsStorageError(); }
}
async function flushHistory(document: ContentDocument | null): Promise<void> {
  if (!document?.pendingSnapshot) return;
  const db = await getMongoDatabase(), snapshot = document.pendingSnapshot;
  await db.collection<Snapshot>(revisions).updateOne({ _id: snapshot._id }, { $setOnInsert: snapshot }, { upsert: true });
  const older = await db.collection<Snapshot>(revisions).find({}, { projection: { _id: 1 } }).sort({ createdAt: -1, _id: -1 }).skip(50).toArray();
  if (older.length) await db.collection<Snapshot>(revisions).deleteMany({ _id: { $in: older.map(item => item._id) } });
  await db.collection<ContentDocument>(sites).updateOne({ _id: "site", "pendingSnapshot._id": snapshot._id }, { $unset: { pendingSnapshot: "" } });
}
export async function getContentState(): Promise<ContentState> {
  return read(await (await getMongoDatabase()).collection<ContentDocument>(sites).findOne({ _id: "site" }));
}
async function write(content: SiteContent | null, expectedRevision: number, author: string, action: RevisionAction): Promise<ContentState> {
  const db = await getMongoDatabase(), collection = db.collection<ContentDocument>(sites);
  const current = await collection.findOne({ _id: "site" }), state = read(current);
  if (state.revision !== expectedRevision) throw new CmsConflictError();
  await flushHistory(current);
  // Preserve both original versions before the first revision-aware write.
  if (current && current.revision === undefined) {
    for (const [kind, value] of [["draft", state.draft], ["published", state.published]] as const) {
      const id = `migration-${kind}`;
      await db.collection<Snapshot>(revisions).updateOne({ _id: id }, { $setOnInsert: { _id: id, revision: 0, content: value, createdAt: new Date(), author, action: "save" } }, { upsert: true });
    }
  }
  const draft = content ?? state.draft, now = new Date(), revision = state.revision + 1;
  const checkpoint = action !== "checkpoint" || !current?.checkpointAt || now.getTime() - current.checkpointAt.getTime() >= 60_000;
  const snapshot: Snapshot = { _id: randomUUID(), revision, content: draft, createdAt: now, author, action };
  const values = { version: CURRENT_CONTENT_VERSION, revision, draft, updatedAt: now,
    ...(action === "publish" ? { published: draft, publishedAt: now } : {}),
    ...(checkpoint ? { checkpointAt: now, pendingSnapshot: snapshot } : {}),
  };
  try {
    if (!current) await collection.insertOne({ _id: "site", published: state.published, publishedAt: null, ...values });
    else {
      const result = await collection.updateOne({ _id: "site", ...(current.revision === undefined ? { revision: { $exists: false } } : { revision: expectedRevision }) }, { $set: values });
      if (!result.matchedCount) throw new CmsConflictError();
    }
  } catch (error: unknown) { if (error instanceof MongoServerError && error.code === 11000) throw new CmsConflictError(); throw error; }
  // A pending snapshot is retried before another write, so history outages cannot lose it.
  try { await flushHistory({ _id: "site", published: state.published, publishedAt: null, ...values }); } catch { /* retry on history read or the next write */ }
  return { draft, published: action === "publish" ? draft : state.published, revision };
}
export async function saveDraft(content: SiteContent, revision: number, author: string, manual = false): Promise<ContentState> { return write(content, revision, author, manual ? "save" : "checkpoint"); }
export async function publishDraft(revision: number, author: string): Promise<ContentState> { return write(null, revision, author, "publish"); }
export async function listRevisions(): Promise<Omit<Snapshot, "content">[]> {
  const db = await getMongoDatabase();
  await flushHistory(await db.collection<ContentDocument>(sites).findOne({ _id: "site" }));
  return db.collection<Snapshot>(revisions).find({}, { projection: { content: 0 } }).sort({ createdAt: -1, _id: -1 }).limit(50).toArray();
}
export async function getRevision(id: string): Promise<Snapshot | null> { return (await getMongoDatabase()).collection<Snapshot>(revisions).findOne({ _id: id }); }
export async function restoreRevision(id: string, revision: number, author: string): Promise<ContentState | null> {
  const snapshot = await getRevision(id);
  return snapshot ? write(parseSiteContent(snapshot.content), revision, author, "restore") : null;
}
export async function getPublishedContent(): Promise<SiteContent> {
  if (process.env.NEXT_PHASE === "phase-production-build" || !process.env.MONGODB_URI) return parseSiteContent(defaultContent);
  try { return (await getContentState()).published; }
  catch (error: unknown) { if (error instanceof CmsStorageError) throw error; return parseSiteContent(defaultContent); }
}
