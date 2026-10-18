import { GridFSBucket } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

import { isSafeMutationRequest, requireAdmin } from "@/features/admin/lib/auth";
import { getMongoDatabase } from "@/lib/mongodb";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const db = await getMongoDatabase();
    const files = await db.collection("cms_media.files").find({}, { projection: { filename: 1, length: 1, uploadDate: 1, metadata: 1 } }).sort({ uploadDate: -1 }).limit(100).toArray();
    return NextResponse.json({ assets: files.map((file) => ({ assetId: file._id.toString(), src: `/api/admin/media/${file._id.toString()}`, name: file.filename, size: file.length, uploadedAt: file.uploadDate, contentType: file.metadata?.contentType })) });
  } catch (error: unknown) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Media unavailable" }, { status: unauthorized ? 401 : 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const session = await requireAdmin(request);
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return NextResponse.json({ error: "A file is required" }, { status: 400 });
    if (!allowedTypes.has(value.type) || value.size <= 0 || value.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Use a PNG, JPEG, WebP, or safe SVG image up to 5 MB" }, { status: 400 });
    }
    const bytes = Buffer.from(await value.arrayBuffer());
    if (value.type === "image/svg+xml" && !isSafeSvg(bytes.toString("utf8"))) {
      return NextResponse.json({ error: "SVG contains unsupported executable content" }, { status: 400 });
    }
    const db = await getMongoDatabase();
    const bucket = new GridFSBucket(db, { bucketName: "cms_media" });
    const filename = value.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "upload";
    const upload = bucket.openUploadStream(filename, {
      metadata: { uploadedBy: session.email, originalName: filename, contentType: value.type },
    });
    await new Promise<void>((resolve, reject) => {
      upload.once("finish", resolve);
      upload.once("error", reject);
      upload.end(bytes);
    });
    return NextResponse.json({ assetId: upload.id.toString(), src: `/api/admin/media/${upload.id.toString()}`, alt: filename });
  } catch (error: unknown) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Media upload unavailable" }, { status: unauthorized ? 401 : 503 });
  }
}

function isSafeSvg(svg: string): boolean {
  return !/<script\b|\bon[a-z]+\s*=|javascript\s*:/i.test(svg);
}
