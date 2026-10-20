import { MongoClient, type Db } from "mongodb";

import { env } from "@/lib/env";

declare global {
  var xoneMongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoDatabase(): Promise<Db> {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

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
