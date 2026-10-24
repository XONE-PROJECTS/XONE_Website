import type { Metadata } from "next";

import { CmsPublicPage } from "@/features/admin/components/CmsPublicPage";
import { createCmsPageMetadata } from "@/lib/metadata";
import { getPublishedContent } from "@/features/admin/lib/repository";
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> { const content = await getPublishedContent(); return createCmsPageMetadata(content.pages.process.seo, { title: "Process", description: `How ${BRAND_NAME} delivers projects from discovery through support.`, path: "/process" }); }

export default function ProcessPage() { return <CmsPublicPage page="process" />; }
