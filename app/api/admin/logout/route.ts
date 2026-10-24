import { NextRequest, NextResponse } from "next/server";

import {
  deleteAdminSession,
  isSafeMutationRequest,
} from "@/features/admin/lib/auth";

export async function POST(request: NextRequest) {
  if (!isSafeMutationRequest(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await deleteAdminSession(request);
  return NextResponse.json({ ok: true });
}
