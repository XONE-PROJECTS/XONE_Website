import { Readable } from "node:stream";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

import { getMongoDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  if (!ObjectId.isValid(assetId))
    return new NextResponse("Not found", { status: 404 });
  try {
    const db = await getMongoDatabase();
    const bucket = new GridFSBucket(db, { bucketName: "cms_media" });
    const file = await db
      .collection("cms_media.files")
      .findOne({ _id: new ObjectId(assetId) });
    if (!file) return new NextResponse("Not found", { status: 404 });
    const stream = bucket.openDownloadStream(new ObjectId(assetId));
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type":
          typeof file.metadata?.contentType === "string"
            ? file.metadata.contentType
            : "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Media unavailable", { status: 503 });
  }
}
