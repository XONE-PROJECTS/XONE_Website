"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { SiteSettings } from "../lib/content";

export function SiteTheme({
  settings,
  children,
  preview = false,
}: {
  settings: SiteSettings;
  children: ReactNode;
  preview?: boolean;
}) {
  const pathname = usePathname();
  if (!preview && pathname.startsWith("/admin")) return <>{children}</>;
  const theme = settings.theme;
  const variables = {
    "--cms-violet": settings.primaryColor,
    "--cms-cyan": settings.accentColor,
    "--primary": theme?.buttonBackground ?? settings.primaryColor,
    "--primary-foreground": theme?.buttonForeground ?? "#ffffff",
    "--cms-button-bg": theme?.buttonBackground ?? settings.primaryColor,
    "--cms-button-color": theme?.buttonForeground ?? "#ffffff",
    ...(theme
      ? {
          "--background": theme.background,
          "--foreground": theme.foreground,
          "--muted-foreground": theme.muted,
          "--cms-section": theme.section,
          "--cms-card": theme.card,
          "--primary": theme.buttonBackground,
          "--primary-foreground": theme.buttonForeground,
          "--cms-button-bg": theme.buttonBackground,
          "--cms-button-color": theme.buttonForeground,
          "--cms-body-size": `${theme.bodySize}px`,
          "--cms-heading-size": `${theme.headingSize}px`,
          "--cms-body-weight": theme.bodyWeight,
          "--cms-heading-weight": theme.headingWeight,
          "--cms-body-leading": theme.lineHeight,
        }
      : {}),
  } as CSSProperties;
  return (
    <div
      className={`cms-site${theme ? " cms-site-themed" : ""} flex min-h-dvh flex-1 flex-col`}
      style={variables}
    >
      {children}
    </div>
  );
}
