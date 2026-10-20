import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { isSafeMutationRequest, requireAdmin } from "@/features/admin/lib/auth";
import { parseSiteContent } from "@/features/admin/lib/content";
import { publishRequestSchema, saveRequestSchema } from "@/features/admin/lib/contracts";
import { CmsConflictError, CmsStorageError, getContentState, publishDraft, saveDraft } from "@/features/admin/lib/repository";

function failure(error: unknown): NextResponse {
  if (error instanceof CmsConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
  if (error instanceof CmsStorageError) return NextResponse.json({ error: error.message }, { status: 422 });
  if (error instanceof ZodError) return NextResponse.json({ error: "Check your content: " + error.issues.slice(0, 3).map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 422 });
  const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
  return NextResponse.json({ error: unauthorized ? "Unauthorized" : "CMS unavailable. Your local edits have been kept. Try again." }, { status: unauthorized ? 401 : 503 });
}
export async function GET(request: NextRequest): Promise<NextResponse> {
  try { await requireAdmin(request); return NextResponse.json(await getContentState(), { headers: { "Cache-Control": "no-store" } }); } catch (error: unknown) { return failure(error); }
}
export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { const admin = await requireAdmin(request); const payload = saveRequestSchema.parse(await request.json()); const content = parseSiteContent(payload.content); return NextResponse.json(await saveDraft(content, payload.revision, admin.email, payload.manual)); } catch (error: unknown) { return failure(error); }
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { const admin = await requireAdmin(request); const payload = publishRequestSchema.parse(await request.json()); const state = await publishDraft(payload.revision, admin.email); revalidatePath("/", "layout"); return NextResponse.json(state); } catch (error: unknown) { return failure(error); }
}
