import type { Metadata } from "next";

import { createRootMetadata } from "@/lib/metadata";

import "./globals.css";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getPublishedContent } from "@/features/admin/lib/repository";

export const metadata: Metadata = createRootMetadata();

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
        <Navbar links={content.settings.navLinks} />
        <main className="w-full flex-1">{children}</main>
        <Footer content={footer} />
      </body>
    </html>
  );
}
