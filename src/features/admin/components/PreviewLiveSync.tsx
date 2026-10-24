"use client";

import { useEffect, useState } from "react";

import { CmsPublicPageContent } from "@/features/admin/components/CmsPublicPageView";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SiteTheme } from "@/features/admin/components/SiteTheme";
import { pageKeys, type PageKey, type SiteContent } from "@/features/admin/lib/content";

export function PreviewLiveSync({ initialContent, initialPage, token }: { initialContent: SiteContent; initialPage: PageKey; token: string }) {
  const [content, setContent] = useState(initialContent);
  const [page, setPage] = useState<PageKey>(initialPage);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("xone-cms-preview");
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!event.data || typeof event.data !== "object" || !("content" in event.data)) return;
      const payload = event.data as { content: SiteContent; page?: PageKey };
      if (!payload.content) return;
      setContent(payload.content);
      if (payload.page && pageKeys.includes(payload.page)) setPage(payload.page);
      setLive(true);
    };
    return () => channel.close();
  }, []);

  const footer = content.pages.footer.blocks.find((block) => block.type === "footer");
  return <SiteTheme settings={content.settings} preview><Navbar links={content.settings.navLinks} settings={content.settings} preview /><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center gap-2 border-b bg-background px-4 py-3"><span className="mr-2 text-sm font-semibold">Preview</span>{pageKeys.map((key) => <button key={key} onClick={() => setPage(key)} className={`min-h-9 rounded-md px-3 text-xs capitalize ${key === page ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>{key}</button>)}{live && <span className="ml-auto text-xs text-emerald-700">Live editor updates connected</span>}<span className="sr-only">Preview token {token.slice(0, 6)}</span></div>{page === "footer" ? null : <CmsPublicPageContent content={content} page={page} />}</div><Footer settings={content.settings} page={content.pages.footer} content={footer} preview /></SiteTheme>;
}
