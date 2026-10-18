import { NextRequest, NextResponse } from "next/server";

import { isSafeMutationRequest, requireAdmin } from "@/features/admin/lib/auth";
import { createPreviewToken } from "@/features/admin/lib/preview";

export async function POST(request: NextRequest) {
  if (!isSafeMutationRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await requireAdmin(request);
    const token = await createPreviewToken();
    return NextResponse.json({ url: `${new URL("/admin/preview", request.url).toString()}?token=${token}` });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Preview unavailable" }, { status: unauthorized ? 401 : 503 });
  }
}
