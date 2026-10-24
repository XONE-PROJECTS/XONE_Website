import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return createCmsPageMetadata(content.pages.contact.seo, {
    title: "Contact",
    description: `Contact ${BRAND_NAME} by email to discuss your software project.`,
    path: "/contact",
  });
}

export default function ContactPage() {
  return <CmsPublicPage page="contact" />;
}
