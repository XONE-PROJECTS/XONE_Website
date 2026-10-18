import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { getMongoDatabase } from "@/lib/mongodb";

export const adminCookieName = "xone_admin_session";
const scrypt = promisify(nodeScrypt);
type SessionDocument = { _id: string; email: string; expiresAt: Date; createdAt: Date };
type AdminUserDocument = { _id: "primary"; email: string; passwordHash: string; createdAt: Date; updatedAt: Date };

function configured(): void {
  if (!env.MONGODB_URI) throw new Error("Admin CMS is not configured");
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  configured();
  const db = await getMongoDatabase();
  let user = await db.collection<AdminUserDocument>("admin_users").findOne({ _id: "primary" });

  if (!user && env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const now = new Date();
    try {
      await db.collection<AdminUserDocument>("admin_users").insertOne({
        _id: "primary",
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: await hashPassword(env.ADMIN_PASSWORD),
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // Another request may have completed the one-time bootstrap first.
    }
    user = await db.collection<AdminUserDocument>("admin_users").findOne({ _id: "primary" });
  }

  if (!user || email.toLowerCase() !== user.email) return false;
  return verifyPasswordHash(password, user.passwordHash);
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

async function verifyPasswordHash(password: string, encodedHash: string): Promise<boolean> {
  const [, salt, expectedHex] = encodedHash.split("$");
  if (!salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }

export async function createAdminSession(email: string): Promise<void> {
  configured();
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.ADMIN_SESSION_TTL_DAYS * 86_400_000);
  const db = await getMongoDatabase();
  await db.collection<SessionDocument>("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection<SessionDocument>("admin_sessions").insertOne({ _id: hashToken(token), email, createdAt: now, expiresAt });
  (await cookies()).set(adminCookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function getAdminSession(request?: NextRequest): Promise<SessionDocument | null> {
  if (!env.MONGODB_URI) return null;
  const token = request?.cookies.get(adminCookieName)?.value ?? (await cookies()).get(adminCookieName)?.value;
  if (!token) return null;
  const db = await getMongoDatabase();
  return db.collection<SessionDocument>("admin_sessions").findOne({ _id: hashToken(token), expiresAt: { $gt: new Date() } });
}

export async function requireAdmin(request?: NextRequest): Promise<SessionDocument> {
  const session = await getAdminSession(request);
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function deleteAdminSession(request?: NextRequest): Promise<void> {
  const token = request?.cookies.get(adminCookieName)?.value ?? (await cookies()).get(adminCookieName)?.value;
  if (token && env.MONGODB_URI) await (await getMongoDatabase()).collection<SessionDocument>("admin_sessions").deleteOne({ _id: hashToken(token) });
  (await cookies()).delete(adminCookieName);
}

export function isSafeMutationRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const requestHost = forwardedHost ?? request.headers.get("host") ?? new URL(request.url).host;
    return originUrl.host === requestHost;
  } catch {
    return false;
  }
}
