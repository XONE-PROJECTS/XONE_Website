import type { PageKey, SiteContent } from "@/features/admin/lib/content";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { CmsPublicPageContent } from "./CmsPublicPageView";

type PublicPage = Exclude<PageKey, "footer">;

export async function CmsPublicPage({ page }: { page: PublicPage }): Promise<React.ReactNode> {
  const content = await getPublishedContent();
  return <CmsPublicPageContent content={content} page={page} />;
}

export { CmsPublicPageContent } from "./CmsPublicPageView";
export type { SiteContent };
