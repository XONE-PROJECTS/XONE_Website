import { createHash, randomBytes } from "node:crypto";

import { getMongoDatabase } from "@/lib/mongodb";
import { getContentState } from "@/features/admin/lib/repository";
import type { SiteContent } from "@/features/admin/lib/content";

type PreviewTokenDocument = { _id: string; expiresAt: Date; createdAt: Date };
const collectionName = "admin_preview_tokens";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPreviewToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const collection = (await getMongoDatabase()).collection<PreviewTokenDocument>(collectionName);
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await collection.insertOne({ _id: hashToken(token), createdAt: now, expiresAt });
  return token;
}

export async function getPreviewContent(token: string): Promise<SiteContent | null> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const document = await (await getMongoDatabase()).collection<PreviewTokenDocument>(collectionName).findOne({ _id: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!document) return null;
  return (await getContentState()).draft;
}
