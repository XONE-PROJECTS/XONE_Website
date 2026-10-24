import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAdminSession,
  isSafeMutationRequest,
  verifyAdminPassword,
} from "@/features/admin/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  if (!isSafeMutationRequest(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }
  try {
    if (!(await verifyAdminPassword(parsed.data.email, parsed.data.password))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }
    await createAdminSession(parsed.data.email);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message.replace(
            /mongodb(?:\+srv)?:\/\/[^\s]+/gi,
            "mongodb://[redacted]",
          )
        : "Unknown error";
    console.error("[admin] MongoDB login unavailable:", message);
    return NextResponse.json(
      { error: "Admin authentication is unavailable" },
      { status: 503 },
    );
  }
}
