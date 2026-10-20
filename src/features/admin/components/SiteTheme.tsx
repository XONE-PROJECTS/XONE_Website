"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { SiteSettings } from "../lib/content";

export function SiteTheme({ settings, children, preview = false }: { settings: SiteSettings; children: ReactNode; preview?: boolean }) {
  const pathname = usePathname();
  if (!preview && pathname.startsWith("/admin")) return <>{children}</>;
  const theme = settings.theme;
  const variables = { "--cms-violet": settings.primaryColor, "--cms-cyan": settings.accentColor,
    ...(theme ? { "--background": theme.background, "--foreground": theme.foreground, "--muted-foreground": theme.muted,
      "--cms-section": theme.section, "--cms-card": theme.card, "--cms-body-size": `${theme.bodySize}px`, "--cms-heading-size": `${theme.headingSize}px`, "--cms-body-weight": theme.bodyWeight, "--cms-heading-weight": theme.headingWeight, "--cms-body-leading": theme.lineHeight } : {}),
  } as CSSProperties;
  return <div className="cms-site flex min-h-dvh flex-1 flex-col" style={variables}>{children}</div>;
}
