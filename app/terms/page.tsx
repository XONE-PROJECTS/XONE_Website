import type { Metadata } from "next";

import { TermsPageContent } from "@/features/legal/components/TermsPageContent";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms of service for using the Xone Software Development marketing website.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsPageContent />;
}
