import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isSafeMutationRequest, requireAdmin } from "@/features/admin/lib/auth";
import { parseSiteContent } from "@/features/admin/lib/content";
import { getContentState, publishDraft, saveDraft } from "@/features/admin/lib/repository";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    return NextResponse.json(await getContentState());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "UNAUTHORIZED" ? "Unauthorized" : "CMS unavailable" }, { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 503 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await requireAdmin(request);
    const content = parseSiteContent(await request.json());
    await saveDraft(content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Invalid content or CMS unavailable" }, { status: unauthorized ? 401 : 422 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await requireAdmin(request);
    const content = await publishDraft();
    ["/", "/projects", "/services", "/about", "/contact"].forEach((path) => revalidatePath(path));
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "CMS unavailable" }, { status: unauthorized ? 401 : 503 });
  }
}
