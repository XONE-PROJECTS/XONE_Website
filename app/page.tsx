import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return createCmsPageMetadata(content.pages.home.seo, { path: "" });
}

export default function HomePage() { return <CmsPublicPage page="home" />; }
