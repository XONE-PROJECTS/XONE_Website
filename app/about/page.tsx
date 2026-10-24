import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return createCmsPageMetadata(content.pages.about.seo, {
    title: "About",
    description: `Learn about ${BRAND_NAME} — our story, values, and approach.`,
    path: "/about",
  });
}

export default function AboutPage() {
  return <CmsPublicPage page="about" />;
}
