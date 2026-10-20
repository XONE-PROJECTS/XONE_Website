import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { defaultContent } from "@/features/admin/lib/content";

const requireAdmin = vi.fn(async () => ({ email: "admin@example.com" }));
const saveDraft = vi.fn(async (content: unknown, revision: number) => ({ draft: content, published: defaultContent, revision: revision + 1 }));

vi.mock("@/features/admin/lib/auth", () => ({ requireAdmin, isSafeMutationRequest: () => true }));
vi.mock("@/features/admin/lib/repository", () => ({
  CmsConflictError: class CmsConflictError extends Error {},
  CmsStorageError: class CmsStorageError extends Error {},
  getContentState: vi.fn(),
  publishDraft: vi.fn(),
  saveDraft,
}));

const { PUT, POST } = await import("../app/api/admin/content/route");

function request(method: "PUT" | "POST", body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/content", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

describe("admin content route boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a save without the optimistic revision envelope", async () => {
    const response = await PUT(request("PUT", defaultContent));
    expect(response.status).toBe(422);
    expect(saveDraft).not.toHaveBeenCalled();
  });

  it("maps a valid save to the repository contract", async () => {
    const response = await PUT(request("PUT", { content: defaultContent, revision: 3, manual: true }));
    expect(response.status).toBe(200);
    expect(saveDraft).toHaveBeenCalledWith(expect.anything(), 3, "admin@example.com", true);
  });

  it("rejects publishing without a revision", async () => {
    const response = await POST(request("POST", {}));
    expect(response.status).toBe(422);
  });
});
