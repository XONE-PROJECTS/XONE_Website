import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";

export async function generateMetadata(): Promise<Metadata> { const content = await getPublishedContent(); return createCmsPageMetadata(content.pages.privacy.seo, { title: "Privacy Policy", description: "Privacy policy for Xone Software Development — how we handle website and email inquiry data.", path: "/privacy" }); }

export default function PrivacyPage() { return <CmsPublicPage page="privacy" />; }
