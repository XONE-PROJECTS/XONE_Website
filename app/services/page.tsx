import type { Metadata } from "next";

import { ServicesPageContent } from "@/features/services/components/ServicesPageContent";
import { createPageMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = createPageMetadata({
  title: "Services",
  description: `${BRAND_NAME} delivers automation, UI/UX, web, and mobile development.`,
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPageContent />;
}
