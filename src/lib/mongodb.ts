import { setServers } from "node:dns";
import { MongoClient, type Db } from "mongodb";

import { env } from "@/lib/env";

declare global {
  var xoneMongoClientPromise: Promise<MongoClient> | undefined;
}

let dnsConfigured = false;

function configureMongoDns(): void {
  if (dnsConfigured) return;
  // shortcut: public DNS availability, when to upgrade: use a VPN/local resolver explicitly.
  setServers(["1.1.1.1", "8.8.8.8"]);
  dnsConfigured = true;
}

export async function getMongoDatabase(): Promise<Db> {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  configureMongoDns();
  globalThis.xoneMongoClientPromise ??= new MongoClient(env.MONGODB_URI, {
    connectTimeoutMS: 5_000,
    serverSelectionTimeoutMS: 5_000,
  }).connect().catch((error: unknown) => {
    globalThis.xoneMongoClientPromise = undefined;
    throw error;
  });
  const client = await globalThis.xoneMongoClientPromise;
  return client.db(env.MONGODB_DB_NAME);
}
