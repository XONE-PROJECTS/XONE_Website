"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { brandAssets, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/features/admin/lib/content";

type NavbarProps = {
  className?: string;
  links?: SiteSettings["navLinks"];
  settings?: SiteSettings;
  preview?: boolean;
};

function navLinkClass(isActive: boolean, mobile = false) {
  if (mobile) {
    return cn(
      "block min-h-11 rounded-md px-4 py-3 text-base font-medium transition-colors",
      isActive
        ? "bg-white/10 text-white"
        : "text-xone-gray-light/90 hover:bg-white/5 hover:text-white",
    );
  }

  return cn(
    "relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-xone-cyan after:transition-transform motion-safe:after:duration-200",
    isActive
      ? "text-white after:scale-x-100"
      : "text-xone-gray-light/90 hover:text-white hover:after:scale-x-100",
  );
}

export function Navbar({
  className,
  links,
  settings,
  preview = false,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/";
  const isAdmin = !preview && pathname.startsWith("/admin");
  const navLinks = (
    links ?? [
      { href: "/projects", label: "Projects", visible: true },
      { href: "/services", label: "Services", visible: true },
      { href: "/about", label: "About", visible: true },
      { href: "/contact", label: "Contact", visible: true },
    ]
  ).filter((link) => link.visible);

  if (isAdmin) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/10 bg-xone-navy shadow-sm",
        className,
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center py-2"
          aria-current={isHome ? "page" : undefined}
        >
          <Image
            src={settings?.logoUrl || brandAssets.logoInverse}
            unoptimized
            alt={settings?.siteName ?? BRAND_NAME}
            width={220}
            height={48}
            priority
            className="h-9 w-auto max-w-[min(52vw,220px)] sm:h-11 sm:max-w-[220px]"
          />
        </Link>

        <>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 lg:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(pathname === link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={settings?.header?.ctaHref ?? "/projects"}
              className={cn(
                buttonVariants({ size: "default" }),
                "hidden border border-white/20 bg-xone-violet text-white hover:bg-xone-violet/90 sm:inline-flex",
              )}
            >
              {settings?.header?.ctaLabel ?? "View projects"}
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-11 min-h-11 min-w-11 text-white hover:bg-white/10 hover:text-white lg:hidden",
                )}
                aria-label="Open navigation menu"
              >
                <MenuIcon className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-white/10 bg-xone-navy text-xone-light w-[min(100vw-2rem,20rem)]"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-1 px-1 pt-2"
                >
                  <Link
                    href="/"
                    className={navLinkClass(pathname === "/", true)}
                    onClick={() => setMobileOpen(false)}
                  >
                    Home
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={navLinkClass(pathname === link.href, true)}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={settings?.header?.ctaHref ?? "/projects"}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-4 min-h-11 w-full bg-xone-violet text-white hover:bg-xone-violet/90",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    View projects
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </>
      </div>
    </header>
  );
}
