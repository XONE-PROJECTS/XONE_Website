"use client";

import { useRef, useState } from "react";
import { AdminSkeleton } from "./AdminSkeleton";
import { PricingPanel } from "./PricingPanel";
import { EditorCanvas } from "./EditorCanvas";
import { CollectionItemSettings, ElementFields } from "./EditorFields";
import {
  HistoryPanel,
  MediaPanel,
  StyleFields,
  ThemePanel,
} from "./EditorPanels";
import { useCmsEditor } from "../hooks/use-cms-editor";
import {
  getPage,
  locateBlock,
  locateCollectionItem,
  locate,
  replacePage,
  type EditorSelection,
  type NodeKind,
  type SelectedPage,
} from "../lib/builder";
import {
  pageKeys,
  type CmsBlock,
  type CmsBuilderElement,
  type CmsPageContent,
  type SiteContent,
} from "../lib/content";
import type { Device, ResponsiveStyle } from "../lib/design";

type Panel = "edit" | "theme" | "media" | "history" | "pricing";
type InspectableNode = {
  id: string;
  label?: string;
  visible?: boolean;
  styles?: ResponsiveStyle;
};

const pageLabels: Record<(typeof pageKeys)[number], string> = {
  prehome: "Pre-home",
  home: "Home",
  projects: "Projects",
  services: "Services",
  about: "About",
  contact: "Contact",
  process: "Process",
  privacy: "Privacy",
  terms: "Terms",
  footer: "Footer",
};

function label(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}
export function AdminDashboard({ email }: { email: string }) {
  const editor = useCmsEditor();
  const {
    content,
    published,
    update,
    save,
    publish,
    restore,
    undo,
    redo,
    canUndo,
    canRedo,
    dirty,
    busy,
    error,
    message,
    conflict,
    revision,
  } = editor;
  const [page, setPage] = useState<SelectedPage>("home");
  const [selected, setSelected] = useState<EditorSelection | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [panel, setPanel] = useState<Panel>("edit");
  const previewWindow = useRef<Window | null>(null);

  const currentPage = content ? getPage(content, page) : null;
  const selectedNode =
    currentPage && selected?.type === "node"
      ? locate(currentPage, selected.id)
      : null;
  const selectedItem =
    currentPage && selected?.type === "item"
      ? locateCollectionItem(currentPage, selected)
      : null;
  const pageTitle = pageLabels[page];

  function broadcast(next: SiteContent): void {
    try {
      const channel = new BroadcastChannel("xone-cms-preview");
      channel.postMessage({ content: next, page });
      channel.close();
    } catch {
      // shortcut: preview sync is best-effort; saved previews remain available.
    }
  }

  function change(next: SiteContent, group = ""): void {
    update(next, group);
    broadcast(next);
  }

  function changePage(nextPage: CmsPageContent): void {
    if (content) change(replacePage(content, page, nextPage));
  }

  function updateElement(
    next: CmsBuilderElement,
    elementId = selectedNode?.kind === "element" ? selectedNode.node.id : null,
  ): void {
    if (!currentPage || !elementId) return;
    const sections = currentPage.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({
          ...column,
          elements: column.elements.map((element) =>
            element.id === elementId ? next : element,
          ),
        })),
      })),
    }));
    changePage({ ...currentPage, sections });
  }

  function updateCollectionItem(nextBlock: CmsBlock): void {
    if (!currentPage || !selectedItem || selected?.type !== "item") return;
    const parent = locateBlock(currentPage, selected.blockId);
    if (
      !parent ||
      parent.kind !== "element" ||
      !("type" in parent.node) ||
      parent.node.type !== "block"
    )
      return;
    updateElement({ ...parent.node, block: nextBlock }, parent.node.id);
  }

  function updateSection(value: { label?: string; visible?: boolean }): void {
    if (!currentPage || selectedNode?.kind !== "section") return;
    changePage({
      ...currentPage,
      sections: currentPage.sections.map((section) =>
        section.id === selectedNode.node.id
          ? { ...section, ...value }
          : section,
      ),
    });
  }

  function updateStyles(styles: ResponsiveStyle): void {
    if (!currentPage) return;
    if (selected?.type === "item" && selectedItem) {
      const nextPage = structuredClone(currentPage);
      const parent = locateBlock(nextPage, selected.blockId);
      if (
        !parent ||
        parent.kind !== "element" ||
        !("type" in parent.node) ||
        parent.node.type !== "block"
      )
        return;
      const block = parent.node.block;
      if (
        block.type !== "cards" &&
        block.type !== "projectCollection" &&
        block.type !== "serviceCollection"
      )
        return;
      block.items[selected.index] = {
        ...block.items[selected.index],
        styles,
      };
      changePage(nextPage);
      return;
    }
    if (!selectedNode) return;
    const { kind } = selectedNode;
    const id = selectedNode.node.id;
    const sections = currentPage.sections.map((section) => {
      if (kind === "section" && section.id === id)
        return { ...section, styles };
      return {
        ...section,
        rows: section.rows.map((row) => {
          if (kind === "row" && row.id === id) return { ...row, styles };
          return {
            ...row,
            columns: row.columns.map((column) => {
              if (kind === "column" && column.id === id)
                return { ...column, styles };
              return {
                ...column,
                elements: column.elements.map((element) =>
                  element.id === id ? { ...element, styles } : element,
                ),
              };
            }),
          };
        }),
      };
    });
    changePage({ ...currentPage, sections });
  }

  async function saveDraft(): Promise<void> {
    if (!(await save(true))) return;
    const previewResponse = await fetch("/api/admin/preview", {
      method: "POST",
    });
    if (!previewResponse.ok) return;
    const preview = (await previewResponse.json()) as { url: string };
    const tab = window.open("about:blank", "xone-cms-preview");
    if (tab) {
      previewWindow.current = tab;
      tab.location.href = `${preview.url}&page=${encodeURIComponent(page)}`;
    }
  }

  if (!content || !published || !currentPage)
    return error ? (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p role="alert" className="text-destructive">
          {error}
        </p>
      </main>
    ) : (
      <AdminSkeleton />
    );

  return (
    <main className="cms-editor flex h-dvh min-h-0 flex-col overflow-hidden bg-muted/30 text-foreground">
      <header className="z-40 shrink-0 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2">
          <div className="mr-auto">
            <p className="text-xs text-muted-foreground">XONE CMS · {email}</p>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <span
            role="status"
            className={`text-sm ${dirty ? "text-amber-700" : "text-emerald-700"}`}
          >
            {conflict ? "Conflict" : dirty ? "Unsaved changes" : "Saved"}
          </span>
          <button
            type="button"
            className="min-h-10 rounded-md border px-3 text-sm disabled:opacity-50"
            disabled={!canUndo || busy}
            onClick={undo}
          >
            Undo
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border px-3 text-sm disabled:opacity-50"
            disabled={!canRedo || busy}
            onClick={redo}
          >
            Redo
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
            disabled={busy || conflict}
            onClick={() => void saveDraft()}
          >
            Save draft
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border px-4 text-sm disabled:opacity-50"
            disabled={busy || dirty || conflict}
            onClick={() => void publish()}
          >
            Publish
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border px-3 text-sm"
            onClick={() =>
              void fetch("/api/admin/logout", { method: "POST" }).then(() =>
                window.location.assign("/admin"),
              )
            }
          >
            Log out
          </button>
        </div>
        {(message || error) && (
          <p
            role={error ? "alert" : "status"}
            className={`mx-auto mt-2 max-w-[1600px] text-sm ${error ? "text-destructive" : "text-emerald-700"}`}
          >
            {error || message}
          </p>
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)_360px]">
        <aside className="hidden min-h-0 overflow-y-auto border-r bg-background p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Pages</h2>
            <button
              type="button"
              className="text-xs text-primary underline"
              onClick={() => setPanel("theme")}
            >
              Site design
            </button>
          </div>
          <nav className="grid gap-2">
            {pageKeys.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  setPage(key);
                  setSelected(null);
                  setPanel("edit");
                }}
                className={`min-h-10 rounded-md px-3 text-left text-sm ${page === key ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
              >
                {pageLabels[key]}
              </button>
            ))}
          </nav>
        </aside>
        <section className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Page canvas</h2>
              <p className="text-sm text-muted-foreground">
                Select a section or item, then edit only that content.
              </p>
            </div>
            <div className="flex rounded-md border bg-background p-1">
              {(["desktop", "tablet", "mobile"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setDevice(item)}
                  className={`min-h-9 rounded px-3 text-xs capitalize ${device === item ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <EditorCanvas
            content={content}
            page={page}
            device={device}
            selected={selected}
            preview={false}
            onSelect={(id) => {
              setSelected(id);
              setPanel("edit");
            }}
            onInline={updateElement}
          />
        </section>
        <aside className="min-h-0 overflow-y-auto border-t bg-background p-4 lg:border-l lg:border-t-0">
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border p-1">
            {(["edit", "theme", "media", "history", "pricing"] as const).map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setPanel(item)}
                  className={`min-h-9 rounded text-xs capitalize ${panel === item ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          {panel === "pricing" && (
            <PricingPanel
              catalog={content.projectEstimator}
              onChange={(projectEstimator) =>
                change({ ...content, projectEstimator })
              }
            />
          )}
          {panel === "theme" && (
            <ThemePanel content={content} onChange={change} />
          )}
          {panel === "media" && (
            <MediaPanel
              onUse={(src, alt) => {
                const element =
                  selectedNode?.kind === "element"
                    ? (selectedNode.node as CmsBuilderElement)
                    : null;
                if (element?.type === "image")
                  updateElement({ ...element, src, alt });
              }}
            />
          )}
          {panel === "history" && (
            <HistoryPanel
              revision={revision}
              disabled={busy || dirty || conflict}
              onRestore={restore}
            />
          )}
          {panel === "edit" && selectedItem && selected?.type === "item" && (
            <>
              <CollectionItemSettings
                block={selectedItem.block}
                index={selectedItem.index}
                onChange={updateCollectionItem}
                onRemove={() => {
                  const parent = currentPage
                    ? locateBlock(currentPage, selectedItem.block.id)
                    : null;
                  setSelected(
                    parent ? { type: "node", id: parent.node.id } : null,
                  );
                }}
              />
              <StyleFields
                styles={selectedItem.item.styles}
                device={device}
                onChange={updateStyles}
                tab="style"
                typography
              />
            </>
          )}
          {panel === "edit" && selectedNode && !selectedItem && (
            <Inspector
              node={selectedNode.node}
              kind={selectedNode.kind}
              device={device}
              onElement={updateElement}
              onStyles={updateStyles}
              onSection={updateSection}
              onAddItem={(index) => {
                if (
                  selectedNode.kind !== "element" ||
                  !("type" in selectedNode.node) ||
                  selectedNode.node.type !== "block"
                )
                  return;
                setSelected({
                  type: "item",
                  blockId: selectedNode.node.block.id,
                  index,
                });
              }}
            />
          )}
          {panel === "edit" && !selectedItem && !selectedNode && (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Select a section or item in the canvas to edit it.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

function Inspector({
  node,
  kind,
  device,
  onElement,
  onStyles,
  onSection,
  onAddItem,
}: {
  node: InspectableNode;
  kind: NodeKind;
  device: Device;
  onElement: (element: CmsBuilderElement) => void;
  onStyles: (styles: ResponsiveStyle) => void;
  onSection: (value: { label?: string; visible?: boolean }) => void;
  onAddItem: (index: number) => void;
}) {
  const style = node.styles;
  const element = kind === "element" ? (node as CmsBuilderElement) : null;
  const typography =
    kind === "element" &&
    (element?.type === "text" ||
      element?.type === "heading" ||
      (element?.type === "block" && element.block.type === "text"));
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="mr-auto">
          <h2 className="font-semibold">{label(kind)}</h2>
          <p className="text-xs text-muted-foreground">
            Changes appear in the canvas immediately.
          </p>
        </div>
      </div>
      {kind === "section" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Section label
            <input
              value={node.label ?? ""}
              onChange={(event) => onSection({ label: event.target.value })}
              className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={node.visible !== false}
              onChange={(event) => onSection({ visible: event.target.checked })}
            />
            Visible
          </label>
        </div>
      )}
      {element && (
        <ElementFields
          element={element}
          onChange={onElement}
          onAddItem={onAddItem}
        />
      )}
      <StyleFields
        styles={style}
        device={device}
        onChange={onStyles}
        tab="style"
        typography={typography}
      />
    </div>
  );
}
