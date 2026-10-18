import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import { getPublishedContent } from "@/features/admin/lib/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublishedContent();
  const page = content.customPageDefinitions.find((item) => item.slug === slug && !item.archived);
  return page ? { title: `${page.name} · ${content.settings.siteName}`, description: page.description || content.settings.defaultDescription } : {};
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPublishedContent();
  const page = content.customPageDefinitions.find((item) => item.slug === slug && !item.archived);
  if (!page) notFound();
  return <CmsPageRenderer blocks={content.customPages[page.id]?.blocks ?? []} />;
}
