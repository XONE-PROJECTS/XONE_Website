import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for Xone Software Development — how we handle website and email inquiry data.",
  path: "/privacy",
});

export default function PrivacyPage() { return <CmsPublicPage page="privacy" />; }
