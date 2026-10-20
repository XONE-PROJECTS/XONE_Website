"use client";

import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SiteTheme } from "./SiteTheme";
import { CmsPageRenderer } from "./CmsPageRenderer";
import { getPage, locate, type SelectedPage } from "../lib/builder";
import type { CmsBuilderElement, SiteContent } from "../lib/content";
import type { Device } from "../lib/design";

const widths = { desktop: 1280, tablet: 768, mobile: 390 };
export function EditorCanvas({ content, page, device, selected, preview, onSelect, onMove, onInline, onAdd }: {
  content: SiteContent; page: SelectedPage; device: Device; selected: string | null; preview: boolean;
  onSelect: (id: string) => void; onMove: (id: string, parent: string | null, before: string | null) => void;
  onInline: (element: CmsBuilderElement) => void; onAdd: (type: string, column: string | null) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null), container = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null), [available, setAvailable] = useState(800);
  const dragId = useRef<string | null>(null), editable = useRef<HTMLElement | null>(null);
  const currentPage = getPage(content, page), width = widths[device], scale = Math.min(1, available / width);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(entries => setAvailable(Math.max(200, entries[0].contentRect.width - 24)));
    observer.observe(container.current); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const document = body?.ownerDocument;
    if (!document) return;
    document.querySelectorAll("[data-cms-selected]").forEach(node => node.removeAttribute("data-cms-selected"));
    if (selected) Array.from(document.querySelectorAll<HTMLElement>("[data-cms-id]")).find(node => node.dataset.cmsId === selected)?.setAttribute("data-cms-selected", "true");
  }, [body, selected, content, preview]);
  useEffect(() => {
    if (!body) return;
    const syncStyles = () => {
      body.ownerDocument.head.querySelectorAll("[data-editor-style]").forEach(node => node.remove());
      document.head.querySelectorAll('style,link[rel="stylesheet"]').forEach(node => { const clone = node.cloneNode(true) as HTMLElement; clone.dataset.editorStyle = "true"; body.ownerDocument.head.appendChild(clone); });
    };
    syncStyles(); const observer = new MutationObserver(syncStyles); observer.observe(document.head, { childList: true, subtree: true, characterData: true }); return () => observer.disconnect();
  }, [body]);
  function select(event: MouseEvent<HTMLDivElement>): void {
    if (preview) return;
    const target = event.target as HTMLElement;
    if (target.closest("a,button,summary,input")) event.preventDefault();
    const node = target.closest<HTMLElement>("[data-cms-id]"); if (node?.dataset.cmsId) onSelect(node.dataset.cmsId);
  }
  function inline(event: MouseEvent<HTMLDivElement>): void {
    if (preview) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("h1,h2,h3,h4,p,a");
    const id = target?.closest<HTMLElement>('[data-cms-kind="element"]')?.dataset.cmsId;
    const node = locate(currentPage, id ?? null)?.node;
    if (!target || !node || !("type" in node)) return;
    const element = node;
    let commit: ((value: string) => CmsBuilderElement) | null = null;
    if (element.type === "text" || element.type === "heading") commit = text => ({ ...element, text });
    else if (element.type === "button" || element.type === "link") commit = label => ({ ...element, label });
    else if (element.type === "block") {
      const block = element.block, text = target.textContent ?? "";
      if ("heading" in block && text === block.heading) commit = heading => ({ ...element, block: { ...block, heading } });
      else if ("body" in block && text === block.body) commit = value => ({ ...element, block: { ...block, body: value } });
      else if ("label" in block && text === block.label) commit = label => ({ ...element, block: { ...block, label } });
      else if (block.type === "text") { const index = block.paragraphs.indexOf(text); if (index >= 0) commit = value => ({ ...element, block: { ...block, paragraphs: block.paragraphs.map((item, i) => i === index ? value : item) } }); }
    }
    if (!commit) return;
    event.preventDefault(); editable.current?.blur(); editable.current = target;
    target.contentEditable = "plaintext-only"; target.classList.add("cms-inline"); target.focus();
    const original = target.textContent ?? "";
    const finish = () => { target.contentEditable = "false"; target.classList.remove("cms-inline"); const value = target.innerText; if (value !== original) onInline(commit!(value)); target.removeEventListener("keydown", keyboard); editable.current = null; };
    const keyboard = (key: KeyboardEvent) => { if (key.key === "Escape") { target.textContent = original; target.blur(); } if (key.key === "Enter" && !key.shiftKey) { key.preventDefault(); target.blur(); } };
    target.addEventListener("blur", finish, { once: true }); target.addEventListener("keydown", keyboard);
  }
  function dropTarget(event: DragEvent<HTMLDivElement>): { parent: string | null; before: string | null } | null {
    const id = dragId.current ?? event.dataTransfer.getData("text/x-xone-node"), source = locate(currentPage, id);
    const target = event.target as HTMLElement;
    if (!source) return null;
    const peer = target.closest<HTMLElement>(`[data-cms-kind="${source.kind}"]`);
    if (peer?.dataset.cmsId) { const located = locate(currentPage, peer.dataset.cmsId); return located ? { parent: located.parent, before: peer.dataset.cmsId } : null; }
    const parentKind = source.kind === "element" ? "column" : source.kind === "column" ? "row" : source.kind === "row" ? "section" : null;
    const parent = parentKind ? target.closest<HTMLElement>(`[data-cms-kind="${parentKind}"]`)?.dataset.cmsId : null;
    return parentKind && !parent ? null : { parent: parent ?? null, before: null };
  }
  return <div ref={container} className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3" data-testid="editor-canvas">
    <div className="mx-auto overflow-hidden rounded-md border bg-white shadow-sm" style={{ width: width * scale, height: 900 * scale }}>
      <iframe ref={frame} title={`${device} website canvas`} srcDoc='<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="canvas-root"></div></body></html>' onLoad={() => setBody(frame.current?.contentDocument?.getElementById("canvas-root") ?? null)} style={{ width, height: 900, transform: `scale(${scale})`, transformOrigin: "top left", border: 0 }} />
    </div>
    {body && createPortal(<div className={preview ? "" : "cms-editing"} onClickCapture={select} onDoubleClick={inline}
      onDragOver={event => { if (preview) return; event.preventDefault(); const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cms-id]"); body.querySelectorAll("[data-cms-drop]").forEach(node => node.removeAttribute("data-cms-drop")); target?.setAttribute("data-cms-drop", "true"); }}
      onDrop={event => { if (preview) return; event.preventDefault(); body.querySelectorAll("[data-cms-drop]").forEach(node => node.removeAttribute("data-cms-drop")); const type = event.dataTransfer.getData("text/x-xone-add"); if (type) { onAdd(type, (event.target as HTMLElement).closest<HTMLElement>('[data-cms-kind="column"]')?.dataset.cmsId ?? null); return; } const target = dropTarget(event); const id = dragId.current ?? event.dataTransfer.getData("text/x-xone-node"); if (target && id) onMove(id, target.parent, target.before); dragId.current = null; }}>
      {!preview && selected && locate(currentPage, selected) && <div className="sticky top-0 z-[60] flex items-center gap-3 border-b bg-white px-4 py-2 text-xs text-slate-600"><span>Double-click text to edit</span><button type="button" draggable onDragStart={event => { dragId.current = selected; event.dataTransfer.setData("text/x-xone-node", selected); }} onDragEnd={() => { dragId.current = null; }} className="ml-auto cursor-grab rounded border px-3 py-2">⠿ Drag selected {locate(currentPage, selected)?.kind}</button></div>}
      <SiteTheme settings={content.settings} preview><Navbar settings={content.settings} links={content.settings.navLinks} preview />
        {page !== "footer" && <CmsPageRenderer sections={currentPage.sections} blocks={currentPage.blocks} includePreflight={preview} editing={!preview} />}
        <Footer settings={content.settings} page={content.pages.footer} content={content.pages.footer.blocks.find(block => block.type === "footer")} preview />
      </SiteTheme>
    </div>, body)}
  </div>;
}
