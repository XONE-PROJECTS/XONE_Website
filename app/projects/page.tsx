import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return createCmsPageMetadata(content.pages.projects.seo, {
    title: "Projects",
    description: `View software projects delivered by ${BRAND_NAME}. Email us to discuss your next build.`,
    path: "/projects",
  });
}

export default function ProjectsPage() {
  return <CmsPublicPage page="projects" />;
}
