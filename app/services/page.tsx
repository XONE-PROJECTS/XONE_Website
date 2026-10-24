import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return createCmsPageMetadata(content.pages.services.seo, {
    title: "Services",
    description: `${BRAND_NAME} delivers automation, UI/UX, web, and mobile development.`,
    path: "/services",
  });
}

export default function ServicesPage() {
  return <CmsPublicPage page="services" />;
}
