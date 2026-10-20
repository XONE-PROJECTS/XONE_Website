import { NextRequest, NextResponse } from "next/server";
import { isSafeMutationRequest, requireAdmin } from "@/features/admin/lib/auth";
import { restoreRequestSchema } from "@/features/admin/lib/contracts";
import { CmsConflictError, getRevision, listRevisions, restoreRevision } from "@/features/admin/lib/repository";
import { ZodError } from "zod";
function failure(error: unknown): NextResponse {
  const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
  return NextResponse.json({ error: unauthorized ? "Unauthorized" : error instanceof CmsConflictError ? error.message : "History unavailable. Your draft has been kept." }, { status: unauthorized ? 401 : error instanceof CmsConflictError ? 409 : error instanceof ZodError ? 422 : 503 });
}
export async function GET(request: NextRequest): Promise<NextResponse> {
  try { await requireAdmin(request); const id = request.nextUrl.searchParams.get("id"); if (id) { const parsed = restoreRequestSchema.shape.id.parse(id); const snapshot = await getRevision(parsed); return snapshot ? NextResponse.json(snapshot) : NextResponse.json({ error: "Revision not found" }, { status: 404 }); } return NextResponse.json({ revisions: await listRevisions() }, { headers: { "Cache-Control": "no-store" } }); } catch (error: unknown) { return failure(error); }
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { const admin = await requireAdmin(request); const payload = restoreRequestSchema.parse(await request.json()); const state = await restoreRevision(payload.id, payload.revision, admin.email); return state ? NextResponse.json(state) : NextResponse.json({ error: "Revision not found" }, { status: 404 }); } catch (error: unknown) { return failure(error); }
}
