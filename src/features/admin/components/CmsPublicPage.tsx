import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import { getPublishedContent } from "@/features/admin/lib/repository";
import type { PageKey } from "@/features/admin/lib/content";

export async function CmsPublicPage({ page }: { page: Exclude<PageKey, "footer"> }) {
  const content = await getPublishedContent();
  const pageContent = content.pages[page];
  return <CmsPageRenderer sections={pageContent.sections} blocks={pageContent.blocks} />;
}
