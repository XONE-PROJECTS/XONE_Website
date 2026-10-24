import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";

export async function generateMetadata(): Promise<Metadata> { const content = await getPublishedContent(); return createCmsPageMetadata(content.pages.terms.seo, { title: "Terms of Service", description: "Terms of service for using the Xone Software Development marketing website.", path: "/terms" }); }

export default function TermsPage() { return <CmsPublicPage page="terms" />; }
