import { notFound } from "next/navigation";

import { getPreviewContent } from "@/features/admin/lib/preview";
import { PreviewLiveSync } from "@/features/admin/components/PreviewLiveSync";
import { pageKeys, type PageKey } from "@/features/admin/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; page?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const content = await getPreviewContent(token);
  if (!content) notFound();
  const requestedPage = params.page ?? "home";
  const page: PageKey = pageKeys.includes(requestedPage as PageKey)
    ? (requestedPage as PageKey)
    : "home";
  return (
    <PreviewLiveSync
      initialContent={content}
      initialPage={page}
      token={token}
    />
  );
}
