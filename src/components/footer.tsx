"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { brandAssets, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import type { CmsBlock, CmsPageContent, SiteSettings } from "@/features/admin/lib/content";

type FooterProps = {
  className?: string;
  settings?: SiteSettings;
  page?: CmsPageContent;
  preview?: boolean;
  content?: Extract<CmsBlock, { type: "footer" }>;
};

export function Footer({ className, content, settings, page, preview = false }: FooterProps) {
  const pathname = usePathname();
  const isAdmin = !preview && pathname.startsWith("/admin");
  const customLayout = Boolean(page?.sections?.length && !content);

  if (isAdmin || settings?.footer?.visible === false || content?.visible === false) {
    return null;
  }

  return (
    <footer
      className={cn(
        "border-t border-border bg-xone-navy text-xone-light",
        className,
      )}
    >
      {customLayout ? <CmsPageRenderer sections={page?.sections} /> : <><div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-4">
          <Image
            src={settings?.logoUrl || brandAssets.logoInverse} unoptimized
            alt={settings?.siteName ?? BRAND_NAME}
            width={140}
            height={36}
            className="h-8 w-auto"
          />
          <p className="text-sm text-xone-gray-light/90">
            {content?.description ?? "Custom software development for teams that need clarity, speed, and reliable delivery."}
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
            Services
          </h2>
          <ul className="space-y-2 text-sm text-xone-gray-light/90">{(content?.links ?? [{ label: "Our Projects", href: "/projects" }, { label: "Web & Mobile Apps", href: "/services" }, { label: "Our Process", href: "/process" }]).slice(0, 3).map((link) => <li key={link.href}><Link href={link.href} className="hover:text-white">{link.label}</Link></li>)}</ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
            Company
          </h2>
          <ul className="space-y-2 text-sm text-xone-gray-light/90">
            {(content?.links ?? [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }]).slice(0, 4).map((link) => <li key={link.href}><Link href={link.href} className="flex min-h-11 items-center hover:text-white">{link.label}</Link></li>)}
            <li>
              <Link
                href="/privacy"
                className="flex min-h-11 items-center hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="flex min-h-11 items-center hover:text-white"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div></>}

      <div className="border-t border-white/10 py-4 text-center text-xs text-xone-gray-light/70">
        © {new Date().getFullYear()} {settings?.siteName ?? BRAND_NAME}. {settings?.footer?.copyright ?? "All rights reserved."}
      </div>
    </footer>
  );
}
