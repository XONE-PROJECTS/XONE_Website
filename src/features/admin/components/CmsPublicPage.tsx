import {
  isDefaultContent,
  type PageKey,
  type SiteContent,
} from "@/features/admin/lib/content";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { CmsPublicPageContent } from "./CmsPublicPageView";

type PublicPage = Exclude<PageKey, "footer">;

export async function CmsPublicPage({
  page,
}: {
  page: PublicPage;
}): Promise<React.ReactNode> {
  const content = await getPublishedContent();
  return (
    <CmsPublicPageContent
      content={content}
      page={page}
      defaultRenderer={isDefaultContent(content)}
    />
  );
}

export { CmsPublicPageContent } from "./CmsPublicPageView";
export type { SiteContent };
