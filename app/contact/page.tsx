import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createPageMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: `Contact ${BRAND_NAME} by email to discuss your software project.`,
  path: "/contact",
});
export default function ContactPage() { return <CmsPublicPage page="contact" />; }
