"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SiteTheme } from "./SiteTheme";
import { CmsPublicPageContent } from "./CmsPublicPageView";
import {
  getPage,
  locate,
  locateCollectionItem,
  type EditorSelection,
  type SelectedPage,
} from "../lib/builder";
import type { CmsBuilderElement, SiteContent } from "../lib/content";
import type { Device } from "../lib/design";

const widths = { desktop: 1280, tablet: 768, mobile: 390 };
export function EditorCanvas({
  content,
  page,
  device,
  selected,
  preview,
  onSelect,
  onInline,
}: {
  content: SiteContent;
  page: SelectedPage;
  device: Device;
  selected: EditorSelection | null;
  preview: boolean;
  onSelect: (selection: EditorSelection) => void;
  onInline: (element: CmsBuilderElement) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null),
    container = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null),
    [available, setAvailable] = useState(800);
  const editable = useRef<HTMLElement | null>(null);
  const currentPage = getPage(content, page),
    width = widths[device],
    scale = Math.min(1, available / width);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) =>
      setAvailable(Math.max(200, entries[0].contentRect.width - 24)),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const document = body?.ownerDocument;
    if (!document) return;
    document
      .querySelectorAll("[data-cms-selected]")
      .forEach((node) => node.removeAttribute("data-cms-selected"));
    if (selected?.type === "node")
      Array.from(document.querySelectorAll<HTMLElement>("[data-cms-id]"))
        .find((node) => node.dataset.cmsId === selected.id)
        ?.setAttribute("data-cms-selected", "true");
    if (selected?.type === "item")
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-cms-item-block]"),
      )
        .find(
          (node) =>
            node.dataset.cmsItemBlock === selected.blockId &&
            Number(node.dataset.cmsItemIndex) === selected.index,
        )
        ?.setAttribute("data-cms-selected", "true");
  }, [body, selected, content, preview]);
  useEffect(() => {
    if (!body) return;
    const syncStyles = () => {
      body.ownerDocument.head
        .querySelectorAll("[data-editor-style]")
        .forEach((node) => node.remove());
      document.head
        .querySelectorAll('style,link[rel="stylesheet"]')
        .forEach((node) => {
          const clone = node.cloneNode(true) as HTMLElement;
          clone.dataset.editorStyle = "true";
          body.ownerDocument.head.appendChild(clone);
        });
    };
    syncStyles();
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [body]);
  function select(event: MouseEvent<HTMLDivElement>): void {
    if (preview) return;
    const target = event.target as HTMLElement;
    if (target.closest("a,button,summary,input")) event.preventDefault();
    const item = target.closest<HTMLElement>("[data-cms-item-block]");
    if (item?.dataset.cmsItemBlock && item.dataset.cmsItemIndex) {
      onSelect({
        type: "item",
        blockId: item.dataset.cmsItemBlock,
        index: Number(item.dataset.cmsItemIndex),
      });
      return;
    }
    const node = target.closest<HTMLElement>("[data-cms-id]");
    if (node?.dataset.cmsId) onSelect({ type: "node", id: node.dataset.cmsId });
  }
  function inline(event: MouseEvent<HTMLDivElement>): void {
    if (preview) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "h1,h2,h3,h4,p,a",
    );
    const id = target?.closest<HTMLElement>('[data-cms-kind="element"]')
      ?.dataset.cmsId;
    const node = locate(currentPage, id ?? null)?.node;
    if (!target || !node || !("type" in node)) return;
    const element = node;
    let commit: ((value: string) => CmsBuilderElement) | null = null;
    if (element.type === "text" || element.type === "heading")
      commit = (text) => ({ ...element, text });
    else if (element.type === "button" || element.type === "link")
      commit = (label) => ({ ...element, label });
    else if (element.type === "block") {
      const block = element.block,
        text = target.textContent ?? "";
      if ("heading" in block && text === block.heading)
        commit = (heading) => ({ ...element, block: { ...block, heading } });
      else if ("body" in block && text === block.body)
        commit = (value) => ({ ...element, block: { ...block, body: value } });
      else if ("label" in block && text === block.label)
        commit = (label) => ({ ...element, block: { ...block, label } });
      else if (block.type === "text") {
        const index = block.paragraphs.indexOf(text);
        if (index >= 0)
          commit = (value) => ({
            ...element,
            block: {
              ...block,
              paragraphs: block.paragraphs.map((item, i) =>
                i === index ? value : item,
              ),
            },
          });
      }
    }
    if (!commit) return;
    event.preventDefault();
    editable.current?.blur();
    editable.current = target;
    target.contentEditable = "plaintext-only";
    target.classList.add("cms-inline");
    target.focus();
    const original = target.textContent ?? "";
    const finish = () => {
      target.contentEditable = "false";
      target.classList.remove("cms-inline");
      const value = target.innerText;
      if (value !== original) onInline(commit!(value));
      target.removeEventListener("keydown", keyboard);
      editable.current = null;
    };
    const keyboard = (key: KeyboardEvent) => {
      if (key.key === "Escape") {
        target.textContent = original;
        target.blur();
      }
      if (key.key === "Enter" && !key.shiftKey) {
        key.preventDefault();
        target.blur();
      }
    };
    target.addEventListener("blur", finish, { once: true });
    target.addEventListener("keydown", keyboard);
  }
  return (
    <div
      ref={container}
      className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3"
      data-testid="editor-canvas"
    >
      <div
        className="mx-auto overflow-hidden rounded-md border bg-white shadow-sm"
        style={{ width: width * scale, height: 900 * scale }}
      >
        <iframe
          ref={frame}
          title={`${device} website canvas`}
          srcDoc='<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="canvas-root"></div></body></html>'
          onLoad={() =>
            setBody(
              frame.current?.contentDocument?.getElementById("canvas-root") ??
                null,
            )
          }
          style={{
            width,
            height: 900,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: 0,
          }}
        />
      </div>
      {body &&
        createPortal(
          <div
            className={preview ? "" : "cms-editing"}
            onClickCapture={select}
            onDoubleClick={inline}
          >
            {!preview &&
              selected &&
              ((selected.type === "node" && locate(currentPage, selected.id)) ||
                (selected.type === "item" &&
                  locateCollectionItem(currentPage, selected))) && (
                <div className="sticky top-0 z-[60] flex items-center gap-3 border-b bg-white px-4 py-2 text-xs text-slate-600">
                  <span>Double-click text to edit</span>
                </div>
              )}
            <SiteTheme settings={content.settings} preview>
              <Navbar
                settings={content.settings}
                links={content.settings.navLinks}
                preview
              />
              {page !== "footer" && (
                <CmsPublicPageContent
                  content={content}
                  page={page}
                  editing={!preview}
                />
              )}
              <Footer
                settings={content.settings}
                page={content.pages.footer}
                content={content.pages.footer.blocks.find(
                  (block) => block.type === "footer",
                )}
                preview
              />
            </SiteTheme>
          </div>,
          body,
        )}
    </div>
  );
}
