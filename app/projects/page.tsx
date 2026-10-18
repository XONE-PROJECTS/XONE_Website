import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createPageMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: `View software projects delivered by ${BRAND_NAME}. Email us to discuss your next build.`,
  path: "/projects",
});
export default function ProjectsPage() { return <CmsPublicPage page="projects" />; }
