import type { Metadata } from "next";

import { PrivacyPageContent } from "@/features/legal/components/PrivacyPageContent";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for Xone Software Development — how we handle website and email inquiry data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
