"use client";

import { usePathname } from "next/navigation";
import { PreFlightIntro } from "./PreFlightIntro";
import type { PreflightContent } from "../data/preflight-content";

export function PreflightGate({ content }: { content: PreflightContent }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <PreFlightIntro content={content} />;
}
