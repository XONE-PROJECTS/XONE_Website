import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createPageMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = createPageMetadata({
  title: "Process",
  description: `How ${BRAND_NAME} delivers projects from discovery through support.`,
  path: "/process",
});

export default function ProcessPage() { return <CmsPublicPage page="process" />; }
