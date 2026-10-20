import type { Metadata } from "next";

import { AboutPageContent } from "@/features/about/components/AboutPageContent";
import { createPageMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description: `Learn about ${BRAND_NAME} — our story, values, and approach.`,
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageContent />;
}
