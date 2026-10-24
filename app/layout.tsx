import type { Metadata } from "next";

import { createRootMetadata } from "@/lib/metadata";
import { SiteTheme } from "@/features/admin/components/SiteTheme";
import { getPublishedContent } from "@/features/admin/lib/repository";

import "./globals.css";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return createRootMetadata(content.settings);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getPublishedContent();
  const footer = content.pages.footer.blocks.find((block) => block.type === "footer");
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <SiteTheme settings={content.settings}>
          <Navbar links={content.settings.navLinks} settings={content.settings} />
          <main className="w-full flex-1">{children}</main>
          <Footer content={footer} page={content.pages.footer} settings={content.settings} />
        </SiteTheme>
      </body>
    </html>
  );
}
