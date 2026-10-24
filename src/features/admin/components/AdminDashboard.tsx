"use client";

import { useRef, useState, type DragEvent } from "react";
import { AdminSkeleton } from "./AdminSkeleton";
import { EditorCanvas } from "./EditorCanvas";
import { ElementFields, SiteSettings } from "./EditorFields";
import { HistoryPanel, MediaPanel, StyleFields, ThemePanel } from "./EditorPanels";
import { useCmsEditor } from "../hooks/use-cms-editor";
import { blockElement, cloneNode, emptySection, getPage, locate, moveNode, replacePage, uid, type NodeKind, type SelectedPage } from "../lib/builder";
import { pageKeys, type CmsBlock, type CmsBuilderElement, type CmsPageContent, type SiteContent } from "../lib/content";
import type { Device, ResponsiveStyle } from "../lib/design";

type Panel = "edit" | "theme" | "media" | "history";
type AddableBlock = Exclude<CmsBlock["type"], "footer">;
type AddableElement = "text" | "heading" | "image" | "button" | "link";
type InspectableNode = { id: string; styles?: ResponsiveStyle };

const pageLabels: Record<(typeof pageKeys)[number], string> = {
  home: "Home", projects: "Projects", services: "Services", about: "About", contact: "Contact",
  process: "Process", privacy: "Privacy", terms: "Terms", footer: "Footer",
};
const blockTypes: AddableBlock[] = ["hero", "text", "cta", "cards", "projectCollection", "serviceCollection", "contact", "preflight", "processCollection", "teamCollection", "legal", "component"];
const elementTypes: AddableElement[] = ["text", "heading", "image", "button", "link"];

function label(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

function newBlock(type: AddableBlock, content: SiteContent): CmsBlock {
  const id = uid();
  if (type === "hero") return { id, type, heading: "New heading", body: "Edit this content.", columns: 1, imageFit: "cover", visible: true };
  if (type === "text") return { id, type, heading: "New section", paragraphs: ["Edit this content."], visible: true };
  if (type === "cta") return { id, type, heading: "New call to action", body: "Edit this content.", label: "Learn more", href: "/contact", visible: true };
  if (type === "cards") return { id, type, heading: "New cards", items: [{ title: "New card", description: "Edit this content." }], columns: 3, visible: true };
  if (type === "projectCollection") return { id, type, heading: "Projects", body: "", display: "grid", items: [], columns: 2, visible: true };
  if (type === "serviceCollection") return { id, type, heading: "Services", body: "Edit this content.", items: [], columns: 2, visible: true };
  if (type === "contact") return { id, type, heading: "Contact", body: "Edit this content.", detailsHeading: "Get in touch", email: content.settings.contactEmail, emailDescription: "Primary way to reach us.", phone: "", phoneDisplay: "", location: "", secondaryLabel: "View our projects", secondaryHref: "/projects", note: "", visible: true };
  if (type === "preflight") return { id, type, logoSrc: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg", logoAlt: content.settings.siteName, objectives: ["Objective one", "Objective two", "Objective three"], reasons: [{ title: "Reason", description: "Edit this content." }], ctaLabel: "Start Building with XONE", visible: true };
  if (type === "processCollection") return { id, type, heading: "How We Work", body: "Edit this content.", items: [{ step: 1, title: "Determine", description: "Edit this content.", details: [] }], visible: true };
  if (type === "teamCollection") return { id, type, heading: "Our team", body: "Edit this content.", items: [{ name: "New team member", role: "Edit this role.", initials: "NM", photoSrc: "" }], columns: 3, visible: true };
  if (type === "legal") return { id, type, title: "Legal page", lastUpdated: new Date().toISOString().slice(0, 10), intro: "Edit this content.", sections: [{ id: uid(), title: "Section", paragraphs: ["Edit this content."], listItems: [] }], visible: true };
  return { id, type: "component", componentKind: "featureSplit", heading: "New component", body: "Edit this content.", label: "Learn more", href: "/contact", items: [], columns: 3, align: "left", spacing: "default", visible: true };
}

function newElement(type: AddableElement): CmsBuilderElement {
  const id = uid();
  if (type === "text") return { id, type, text: "Edit this text." };
  if (type === "heading") return { id, type, text: "New heading", level: "h2" };
  if (type === "image") return { id, type, src: "/assets/XONE/xone_brand_kit/xone_logo.svg", alt: "Edit image description" };
  if (type === "button") return { id, type, label: "Learn more", href: "/contact" };
  return { id, type, label: "Read more", href: "/projects" };
}

export function AdminDashboard({ email }: { email: string }) {
  const editor = useCmsEditor();
  const { content, published, update, save, publish, restore, undo, redo, canUndo, canRedo, dirty, busy, error, message, conflict, revision } = editor;
  const [page, setPage] = useState<SelectedPage>("home");
  const [selected, setSelected] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [panel, setPanel] = useState<Panel>("edit");
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const previewWindow = useRef<Window | null>(null);

  const currentPage = content ? getPage(content, page) : null;
  const selectedNode = currentPage && selected ? locate(currentPage, selected) : null;
  const customPages = content?.customPageDefinitions.filter((item) => !item.archived) ?? [];
  const pageTitle = page.startsWith("custom:") ? customPages.find((item) => item.id === page.slice(7))?.name ?? "Custom page" : pageLabels[page as keyof typeof pageLabels];

  function broadcast(next: SiteContent): void {
    try {
      const channel = new BroadcastChannel("xone-cms-preview");
      channel.postMessage({ content: next, page: page.startsWith("custom:") ? "home" : page });
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

  function updateElement(next: CmsBuilderElement): void {
    if (!currentPage || !selectedNode || selectedNode.kind !== "element") return;
    const sections = currentPage.sections.map((section) => ({ ...section, rows: section.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, elements: column.elements.map((element) => element.id === next.id ? next : element) })) })) }));
    changePage({ ...currentPage, sections });
  }

  function updateStyles(kind: NodeKind, id: string, styles: ResponsiveStyle): void {
    if (!currentPage) return;
    const sections = currentPage.sections.map((section) => {
      if (kind === "section" && section.id === id) return { ...section, styles };
      return { ...section, rows: section.rows.map((row) => {
        if (kind === "row" && row.id === id) return { ...row, styles };
        return { ...row, columns: row.columns.map((column) => {
          if (kind === "column" && column.id === id) return { ...column, styles };
          return { ...column, elements: column.elements.map((element) => element.id === id ? { ...element, styles } : element) };
        }) };
      }) };
    });
    changePage({ ...currentPage, sections });
  }

  function move(id: string, parent: string | null, before: string | null): void {
    if (!currentPage) return;
    const next = moveNode(currentPage, id, parent, before);
    if (next !== currentPage) changePage(next);
  }

  function add(type: string, columnId: string | null = null): void {
    if (!content || !currentPage) return;
    if (type.startsWith("element:")) {
      const sections = currentPage.sections.length ? structuredClone(currentPage.sections) : [emptySection()];
      const clonedPage = { ...currentPage, sections };
      const target = columnId ? locate(clonedPage, columnId)?.node : null;
      const column = target && "elements" in target ? target : sections[0]?.rows[0]?.columns[0];
      if (!column) return;
      const element = newElement(type.slice(8) as AddableElement);
      column.elements.push(element);
      changePage(clonedPage);
      setSelected(element.id);
      return;
    }
    const block = newBlock(type as AddableBlock, content);
    const element = blockElement(block);
    const section = emptySection();
    section.label = label(block.type);
    section.rows[0]?.columns[0]?.elements.push(element);
    changePage({ ...currentPage, sections: [...currentPage.sections, section] });
    setSelected(element.id);
  }

  function addFromDrag(event: DragEvent<HTMLButtonElement>, type: string): void {
    event.dataTransfer.setData("text/x-xone-add", type);
    event.dataTransfer.effectAllowed = "copy";
  }

  function selectedAction(action: "duplicate" | "delete" | "toggle"): void {
    if (!currentPage || !selectedNode) return;
    if (action === "toggle") {
      if (selectedNode.kind === "section") changePage({ ...currentPage, sections: currentPage.sections.map((item) => item.id === selectedNode.node.id ? { ...item, visible: !item.visible } : item) });
      const element = selectedNode.kind === "element" ? selectedNode.node as CmsBuilderElement : null;
      if (element?.type === "block") updateElement({ ...element, block: { ...element.block, visible: !element.block.visible } });
      return;
    }
    const draft = structuredClone(currentPage);
    const located = locate(draft, selectedNode.node.id);
    if (!located) return;
    if (action === "delete") {
      if (located.kind === "row" && located.siblings.length <= 1) return;
      if (located.kind === "column" && located.siblings.length <= 1) return;
      located.siblings.splice(located.index, 1);
      changePage(draft);
      setSelected(null);
      return;
    }
    const copy = cloneNode(located.node);
    located.siblings.splice(located.index + 1, 0, copy);
    changePage(draft);
    setSelected(copy.id);
  }

  function addPage(): void {
    if (!content) return;
    const name = newPageName.trim();
    const slug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!name || !slug || pageKeys.some((key) => key === slug) || customPages.some((item) => item.slug === slug)) return;
    const id = uid();
    change({ ...content, customPages: { ...content.customPages, [id]: { blocks: [], sections: [], seo: { title: "", description: "", noIndex: false } } }, customPageDefinitions: [...content.customPageDefinitions, { id, name, slug, description: "", archived: false }] });
    setPage(`custom:${id}`);
    setSelected(null);
    setNewPageName("");
    setNewPageSlug("");
  }

  async function saveDraft(): Promise<void> {
    if (!(await save(true))) return;
    const previewResponse = await fetch("/api/admin/preview", { method: "POST" });
    if (!previewResponse.ok) return;
    const preview = (await previewResponse.json()) as { url: string };
    const tab = window.open("about:blank", "xone-cms-preview");
    if (tab) { previewWindow.current = tab; tab.location.href = `${preview.url}&page=${encodeURIComponent(page.startsWith("custom:") ? "home" : page)}`; }
  }

  if (!content || !published || !currentPage) return error ? <main className="mx-auto max-w-6xl px-4 py-12"><p role="alert" className="text-destructive">{error}</p></main> : <AdminSkeleton />;

  return <main className="cms-editor flex h-dvh min-h-0 flex-col overflow-hidden bg-muted/30 text-foreground">
    <header className="z-40 shrink-0 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2"><div className="mr-auto"><p className="text-xs text-muted-foreground">XONE CMS · {email}</p><h1 className="text-lg font-semibold">{pageTitle}</h1></div><span role="status" className={`text-sm ${dirty ? "text-amber-700" : "text-emerald-700"}`}>{conflict ? "Conflict" : dirty ? "Unsaved changes" : "Saved"}</span><button type="button" className="min-h-10 rounded-md border px-3 text-sm disabled:opacity-50" disabled={!canUndo || busy} onClick={undo}>Undo</button><button type="button" className="min-h-10 rounded-md border px-3 text-sm disabled:opacity-50" disabled={!canRedo || busy} onClick={redo}>Redo</button><button type="button" className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50" disabled={busy || conflict} onClick={() => void saveDraft()}>Save draft</button><button type="button" className="min-h-10 rounded-md border px-4 text-sm disabled:opacity-50" disabled={busy || dirty || conflict} onClick={() => void publish()}>Publish</button><button type="button" className="min-h-10 rounded-md border px-3 text-sm" onClick={() => void fetch("/api/admin/logout", { method: "POST" }).then(() => window.location.assign("/admin"))}>Log out</button></div>{(message || error) && <p role={error ? "alert" : "status"} className={`mx-auto mt-2 max-w-[1600px] text-sm ${error ? "text-destructive" : "text-emerald-700"}`}>{error || message}</p>}</header>
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)_360px]">
      <aside className="hidden min-h-0 overflow-y-auto border-r bg-background p-4 lg:block"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Pages</h2><button type="button" className="text-xs text-primary underline" onClick={() => setPanel("theme")}>Site design</button></div><nav className="grid gap-2">{pageKeys.map((key) => <button type="button" key={key} onClick={() => { setPage(key); setSelected(null); setPanel("edit"); }} className={`min-h-10 rounded-md px-3 text-left text-sm ${page === key ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>{pageLabels[key]}</button>)}{customPages.map((item) => <button type="button" key={item.id} onClick={() => { setPage(`custom:${item.id}`); setSelected(null); setPanel("edit"); }} className={`min-h-10 rounded-md px-3 text-left text-sm ${page === `custom:${item.id}` ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>{item.name}</button>)}</nav><div className="mt-6 space-y-2 border-t pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New page</p><input value={newPageName} onChange={(event) => setNewPageName(event.target.value)} placeholder="Page name" className="min-h-10 w-full rounded-md border bg-background px-3 text-sm" /><input value={newPageSlug} onChange={(event) => setNewPageSlug(event.target.value)} placeholder="url-slug" className="min-h-10 w-full rounded-md border bg-background px-3 text-sm" /><button type="button" onClick={addPage} className="min-h-10 w-full rounded-md border text-sm hover:bg-muted">+ Add page</button></div></aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Page canvas</h2><p className="text-sm text-muted-foreground">Select, drag, drop, or double-click content to edit it.</p></div><div className="flex rounded-md border bg-background p-1">{(["desktop", "tablet", "mobile"] as const).map((item) => <button type="button" key={item} onClick={() => setDevice(item)} className={`min-h-9 rounded px-3 text-xs capitalize ${device === item ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{item}</button>)}</div></div><EditorCanvas content={content} page={page} device={device} selected={selected} preview={false} onSelect={(id) => { setSelected(id); setPanel("edit"); }} onMove={move} onInline={updateElement} onAdd={add} /></section>
      <aside className="min-h-0 overflow-y-auto border-t bg-background p-4 lg:border-l lg:border-t-0"><div className="mb-4 grid grid-cols-4 gap-1 rounded-md border p-1">{(["edit", "theme", "media", "history"] as const).map((item) => <button type="button" key={item} onClick={() => setPanel(item)} className={`min-h-9 rounded text-xs capitalize ${panel === item ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{item}</button>)}</div>{panel === "theme" && <ThemePanel content={content} onChange={change} />}{panel === "media" && <MediaPanel onUse={(src, alt) => { const element = selectedNode?.kind === "element" ? selectedNode.node as CmsBuilderElement : null; if (element?.type === "image") updateElement({ ...element, src, alt }); }} />}{panel === "history" && <HistoryPanel revision={revision} disabled={busy || dirty || conflict} onRestore={restore} />}{panel === "edit" && selectedNode && <Inspector node={selectedNode.node} kind={selectedNode.kind} device={device} onElement={updateElement} onStyles={(styles) => updateStyles(selectedNode.kind, selectedNode.node.id, styles)} onAction={selectedAction} />}{panel === "edit" && !selectedNode && <SiteSettings content={content} onChange={change} />}<div className="mt-6 border-t pt-4"><h2 className="mb-3 font-semibold">Add elements</h2><div className="grid gap-2">{elementTypes.map((type) => <button type="button" draggable key={type} onDragStart={(event) => addFromDrag(event, `element:${type}`)} onClick={() => add(`element:${type}`)} className="min-h-10 rounded-md border px-3 text-left text-sm capitalize hover:bg-muted">+ {type}</button>)}{blockTypes.map((type) => <button type="button" draggable key={type} onDragStart={(event) => addFromDrag(event, type)} onClick={() => add(type)} className="min-h-10 rounded-md border px-3 text-left text-sm hover:bg-muted">+ {label(type)}</button>)}</div></div></aside>
    </div>
  </main>;
}

function Inspector({ node, kind, device, onElement, onStyles, onAction }: { node: InspectableNode; kind: NodeKind; device: Device; onElement: (element: CmsBuilderElement) => void; onStyles: (styles: ResponsiveStyle) => void; onAction: (action: "duplicate" | "delete" | "toggle") => void }) {
  const style = node.styles;
  const element = kind === "element" ? node as CmsBuilderElement : null;
  return <div className="space-y-5"><div className="flex items-center gap-2"><div className="mr-auto"><h2 className="font-semibold">{label(kind)}</h2><p className="text-xs text-muted-foreground">Changes appear in the canvas immediately.</p></div><button type="button" className="text-xs underline" onClick={() => onAction("duplicate")}>Duplicate</button><button type="button" className="text-xs text-destructive underline" onClick={() => onAction("delete")}>Delete</button></div>{kind === "section" || (element?.type === "block") ? <button type="button" className="min-h-9 rounded border px-3 text-xs" onClick={() => onAction("toggle")}>Toggle visibility</button> : null}{element && <ElementFields element={element} onChange={onElement} />}<StyleFields styles={style} device={device} onChange={onStyles} tab="layout" /><StyleFields styles={style} device={device} onChange={onStyles} tab="style" /></div>;
}
