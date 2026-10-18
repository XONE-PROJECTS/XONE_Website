import { notFound } from "next/navigation";

import { getPreviewContent } from "@/features/admin/lib/preview";
import { RestoredPublicPage } from "@/features/admin/components/RestoredPublicPage";
import { pageKeys, type PageKey } from "@/features/admin/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPreviewPage({ searchParams }: { searchParams: Promise<{ token?: string; page?: string }> }) {
  const params = await searchParams;
  const token = params.token ?? "";
  const content = await getPreviewContent(token);
  if (!content) notFound();
  const requestedPage = params.page ?? "home";
  const page: PageKey = pageKeys.includes(requestedPage as PageKey) ? requestedPage as PageKey : "home";
  return <main className="min-h-screen bg-xone-section"><div className="sticky top-0 z-50 border-b bg-amber-100 px-4 py-3 text-center text-sm text-amber-950"><strong>Restored public preview</strong> · CMS edits are temporarily reset to the public baseline.</div><RestoredPublicPage page={page} /></main>;
}
