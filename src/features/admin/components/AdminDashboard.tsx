"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";

import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { CmsPageRenderer } from "@/features/admin/components/CmsPageRenderer";
import {
  pageKeys,
  parseSiteContent,
  type CmsBlock,
  type CmsBuilderElement,
  type CmsBuilderSection,
  type CmsPageContent,
  type CmsComponentKind,
  type CmsVisualAsset,
  type PageKey,
  type SiteContent,
} from "@/features/admin/lib/content";

type SelectedPage = PageKey | `custom:${string}`;
type Device = "desktop" | "tablet" | "mobile";
type MobileWorkspace = "canvas" | "edit" | "add";
type AddableBlockType =
  | "text"
  | "hero"
  | "cta"
  | "cards"
  | "projectCollection"
  | "serviceCollection"
  | "contact"
  | "preflight"
  | "processCollection"
  | "teamCollection"
  | "legal"
  | "component";
type AddableElementType = "text" | "heading" | "image" | "button" | "link";
const publicComponentKinds: CmsComponentKind[] = [
  "homeHero", "featuredProjects", "teamStrip", "homeCta", "services",
  "process", "projectsCarousel", "contact", "aboutStory", "values", "legal",
];
const uiComponentKinds: CmsComponentKind[] = [
  "featureSplit", "stats", "testimonial", "faq", "logoStrip", "badge",
  "alert", "image", "divider", "spacer", "text", "buttonGroup", "formPresentation",
];
const addableBlockTypes: AddableBlockType[] = [
  "hero",
  "text",
  "cta",
  "cards",
  "projectCollection",
  "serviceCollection",
  "contact",
  "preflight",
  "processCollection",
  "teamCollection",
  "legal",
];
const pageLabels: Record<PageKey, string> = {
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
const deviceWidths: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};
function createClientId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (typeof randomUuid === "function")
    return randomUuid.call(globalThis.crypto);
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function blockLabel(block: CmsBlock): string {
  return block.type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase());
}
function customPageId(selection: SelectedPage): string | null {
  return selection.startsWith("custom:")
    ? selection.slice("custom:".length)
    : null;
}
function getPage(
  content: SiteContent,
  selection: SelectedPage,
): CmsPageContent {
  const id = customPageId(selection);
  return id
    ? (content.customPages[id] ?? { blocks: [], sections: [] })
    : content.pages[selection as PageKey];
}
function replacePage(
  content: SiteContent,
  selection: SelectedPage,
  page: CmsPageContent,
): SiteContent {
  const id = customPageId(selection);
  return id
    ? { ...content, customPages: { ...content.customPages, [id]: page } }
    : { ...content, pages: { ...content.pages, [selection]: page } };
}

function findBlockElement(sections: readonly CmsBuilderSection[], blockId?: string | null): CmsBlock | null {
  for (const section of sections) for (const row of section.rows) for (const column of row.columns) for (const element of column.elements) {
    if (element.type === "block" && (!blockId || element.block.id === blockId)) return element.block;
  }
  return null;
}

function findBuilderElement(sections: readonly CmsBuilderSection[], elementId?: string | null): CmsBuilderElement | null {
  for (const section of sections) for (const row of section.rows) for (const column of row.columns) for (const element of column.elements) if (element.id === elementId) return element;
  return null;
}

function updateBlockInSections(sections: readonly CmsBuilderSection[], next: CmsBlock): CmsBuilderSection[] {
  return sections.map((section) => ({ ...section, rows: section.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, elements: column.elements.map((element) => element.type === "block" && element.block.id === next.id ? { ...element, block: next } : element) })) })) }));
}

function duplicateSection(section: CmsBuilderSection): CmsBuilderSection {
  const copy = structuredClone(section);
  return {
    ...copy,
    id: `${copy.id}-copy-${createClientId()}`,
    label: `Copy of ${copy.label}`,
    rows: copy.rows.map((row) => ({
      ...row,
      id: `${row.id}-copy-${createClientId()}`,
      columns: row.columns.map((column) => ({
        ...column,
        id: `${column.id}-copy-${createClientId()}`,
        elements: column.elements.map((element) => ({
          ...element,
          id: `${element.id}-copy-${createClientId()}`,
          ...(element.type === "block"
            ? { block: { ...element.block, id: `${element.block.id}-copy-${createClientId()}` } }
            : {}),
        })),
      })),
    })),
  };
}

export function AdminDashboard({ email }: { email: string }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [publishedContent, setPublishedContent] = useState<SiteContent | null>(null);
  const [page, setPage] = useState<SelectedPage>("home");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [mobileWorkspace, setMobileWorkspace] =
    useState<MobileWorkspace>("canvas");
  const [panel, setPanel] = useState<"editor" | "settings">("editor");
  const [history, setHistory] = useState<SiteContent[]>([]);
  const [future, setFuture] = useState<SiteContent[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const previewWindow = useRef<Window | null>(null);

  useEffect(() => {
    void fetch("/api/admin/content")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load CMS content");
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || !("draft" in payload))
          throw new Error("Invalid CMS response");
        if (!("published" in payload)) throw new Error("Invalid CMS response");
        setContent(parseSiteContent(payload.draft));
        setPublishedContent(parseSiteContent(payload.published));
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load CMS content",
        ),
      );
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (history.length) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [history.length]);

  const currentPage = content ? getPage(content, page) : null;
  const publishedPage = publishedContent ? getPage(publishedContent, page) : null;
  const selectedBlock =
    currentPage ? findBlockElement(currentPage.sections, selectedBlockId) : null;
  const selectedElement = currentPage ? findBuilderElement(currentPage.sections, selectedBlockId) : null;
  const updateContent = useCallback(
    (next: SiteContent) => {
      setContent((current) => {
        if (!current) return next;
        setHistory((items) => [...items.slice(-29), current]);
        setFuture([]);
        return next;
      });
      setMessage("");
      setError("");
      try {
        const channel = new BroadcastChannel("xone-cms-preview");
        channel.postMessage({ content: next, page });
        channel.close();
      } catch {
        /* shortcut: preview sync is best-effort, saved previews remain available */
      }
    },
    [page],
  );
  function updateBlock(next: CmsBlock): void {
    if (content && currentPage) updateContent(replacePage(content, page, { blocks: currentPage.blocks.map((block) => block.id === next.id ? next : block), sections: updateBlockInSections(currentPage.sections, next) }));
  }
  function updatePageSections(sections: CmsBuilderSection[]): void {
    if (!content || !currentPage) return;
    const blocks = sections.flatMap((section) => section.rows.flatMap((row) => row.columns.flatMap((column) => column.elements.flatMap((element) => element.type === "block" ? [element.block] : []))));
    updateContent(replacePage(content, page, { blocks, sections }));
  }
  function updateSelectedElement(next: CmsBuilderElement): void {
    if (!currentPage) return;
    updatePageSections(currentPage.sections.map((section) => ({ ...section, rows: section.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, elements: column.elements.map((item) => item.id === next.id ? next : item) })) })) })));
  }
  function addBlock(
    type: AddableBlockType,
    componentKind?: CmsComponentKind,
  ): void {
    if (!currentPage) return;
    const id = `${page}-${createClientId()}`;
    const block: CmsBlock =
      type === "component"
        ? {
            id,
            type,
            componentKind: componentKind ?? "featureSplit",
            heading: componentKind ? componentKind.replace(/([A-Z])/g, " $1") : "New component",
            body: "Edit this component content.",
            label: "Learn more",
            href: "/contact",
            items: [],
            columns: 3,
            align: "left",
            spacing: "default",
            visible: true,
          }
        : type === "text"
        ? {
            id,
            type,
            heading: "New section",
            paragraphs: ["Edit this content."],
            visible: true,
          }
        : type === "hero"
          ? {
              id,
              type,
              heading: "New heading",
              body: "Edit this content.",
              columns: 1,
              imageFit: "cover",
              visible: true,
            }
          : type === "cta"
            ? {
                id,
                type,
                heading: "New call to action",
                body: "Edit this content.",
                label: "Learn more",
                href: "/contact",
                visible: true,
              }
            : type === "cards"
              ? {
                  id,
                  type,
                  heading: "New cards",
                  items: [
                    { title: "New card", description: "Edit this content." },
                  ],
                  columns: 3,
                  visible: true,
                }
              : type === "projectCollection"
                ? {
                    id,
                    type,
                    heading: "Projects",
                    body: "",
                    display: "grid",
                    items: [],
                    columns: 2,
                    visible: true,
                  }
                : type === "serviceCollection"
                  ? {
                      id,
                      type,
                      heading: "Services",
                      items: [],
                      columns: 2,
                      visible: true,
                    }
                  : type === "preflight"
                    ? {
                        id,
                        type,
                        logoSrc: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
                        logoAlt: "Xone Software Development",
                        objectives: ["Objective one", "Objective two", "Objective three"],
                        reasons: [{ title: "Reason", description: "Edit this content." }],
                        ctaLabel: "Start Building with XONE",
                        visible: true,
                      }
                    : type === "processCollection"
                      ? {
                          id,
                          type,
                          heading: "How We Work",
                          body: "Edit this content.",
                          items: [{ step: 1, title: "Determine", description: "Edit this content." }],
                          visible: true,
                        }
                      : type === "teamCollection"
                        ? {
                            id,
                            type,
                            heading: "Our team",
                            body: "Edit this content.",
                            items: [{ name: "New team member", role: "Edit this role.", initials: "NM", photoSrc: "" }],
                            columns: 3,
                            visible: true,
                          }
                        : type === "legal"
                          ? {
                              id,
                              type,
                              title: "Legal page",
                              lastUpdated: new Date().toISOString().slice(0, 10),
                              intro: "Edit this content.",
                              sections: [{ id: "section", title: "Section", paragraphs: ["Edit this content."], listItems: [] }],
                              visible: true,
                            }
                          : {
                      id,
                      type,
                      heading: "Contact",
                      body: "Edit this content.",
                      email:
                        content?.settings.contactEmail ??
                        "xonesoftware.marketing@gmail.com",
                      phone: "",
                      location: "",
                      secondaryLabel: "View our projects",
                      secondaryHref: "/projects",
                      visible: true,
                    };
    updatePageSections([...currentPage.sections, { id: `${id}-section`, label: blockLabel(block), visible: true, rows: [{ id: `${id}-row`, columns: [{ id: `${id}-column`, elements: [{ id, type: "block", block }] }] }] }]);
    setSelectedBlockId(id);
  }
  function addElement(type: AddableElementType): void {
    if (!currentPage) return;
    const id = `${page}-${type}-${createClientId()}`;
    const element: CmsBuilderElement = type === "text"
      ? { id, type, text: "Edit this text." }
      : type === "heading"
        ? { id, type, text: "New heading", level: "h2" }
        : type === "image"
          ? { id, type, src: "/assets/XONE/xone_brand_kit/xone_logo.svg", alt: "Edit image description" }
          : type === "button"
            ? { id, type, label: "Learn more", href: "/contact" }
            : { id, type, label: "Read more", href: "/projects" };
    const sections = currentPage.sections.length ? structuredClone(currentPage.sections) : [{ id: `${id}-section`, label: "New section", visible: true, rows: [{ id: `${id}-row`, columns: [{ id: `${id}-column`, elements: [] }] }] }];
    const last = sections.at(-1);
    if (!last) return;
    const row = last.rows[0];
    if (!row) return;
    row.columns[0]?.elements.push(element);
    updatePageSections(sections);
    setSelectedBlockId(id);
  }
  function handleCanvasDrop(event: DragEvent<HTMLDivElement>): void {
    const type = event.dataTransfer.getData("application/x-xone-block");
    const supported = [
      "hero",
      "text",
      "cta",
      "cards",
      "projectCollection",
      "serviceCollection",
      "contact",
      "preflight",
      "processCollection",
      "teamCollection",
      "legal",
    ] as const;
    if (supported.includes(type as (typeof supported)[number])) {
      event.preventDefault();
      addBlock(type as (typeof supported)[number]);
    }
  }
  function undo(): void {
    const previous = history.at(-1);
    if (!content || !previous) return;
    setFuture((items) => [...items, content]);
    setHistory((items) => items.slice(0, -1));
    setContent(previous);
  }
  function redo(): void {
    const next = future.at(-1);
    if (!content || !next) return;
    setHistory((items) => [...items, content]);
    setFuture((items) => items.slice(0, -1));
    setContent(next);
  }
  async function saveDraft(): Promise<void> {
    if (!content) return;
    const reservedTab = window.open("about:blank", "xone-cms-preview");
    if (reservedTab) previewWindow.current = reservedTab;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok)
        throw new Error(
          ((await response.json()) as { error?: string }).error ??
            "Unable to save draft",
        );
      const previewResponse = await fetch("/api/admin/preview", {
        method: "POST",
      });
      if (!previewResponse.ok)
        throw new Error("Draft saved, but preview could not be opened");
      const preview = (await previewResponse.json()) as { url: string };
      if (previewWindow.current && !previewWindow.current.closed)
        previewWindow.current.location.href = `${preview.url}&page=${encodeURIComponent(page)}`;
      setHistory([]);
      setFuture([]);
      setMessage("Draft saved. Preview opened in a new tab.");
    } catch (reason: unknown) {
      if (
        previewWindow.current &&
        !previewWindow.current.closed &&
        previewWindow.current.location.href === "about:blank"
      )
        previewWindow.current.close();
      setError(
        reason instanceof Error ? reason.message : "Unable to save draft",
      );
    } finally {
      setBusy(false);
    }
  }
  async function publish(): Promise<void> {
    if (!content || history.length) {
      setError("Save the draft before publishing.");
      return;
    }
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/content", { method: "POST" });
      if (!response.ok)
        throw new Error(
          ((await response.json()) as { error?: string }).error ??
            "Unable to publish draft",
        );
      const payload = (await response.json()) as { content?: unknown };
      if (payload.content) setPublishedContent(parseSiteContent(payload.content));
      setMessage("Published successfully.");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Unable to publish draft",
      );
    } finally {
      setBusy(false);
    }
  }
  function addPage(): void {
    if (!content) return;
    const name = newPageName.trim();
    const slug = newPageSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (
      !name ||
      !slug ||
      pageKeys.some((key) => key === slug) ||
      content.customPageDefinitions.some((item) => item.slug === slug)
    ) {
      setError("Enter a unique page name and URL slug.");
      return;
    }
    const id = createClientId();
    updateContent({
      ...content,
      customPages: { ...content.customPages, [id]: { blocks: [], sections: [] } },
      customPageDefinitions: [
        ...content.customPageDefinitions,
        { id, name, slug, description: "", archived: false },
      ],
    });
    setPage(`custom:${id}`);
    setNewPageName("");
    setNewPageSlug("");
  }
  if (!content)
    return error ? (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p role="alert" className="text-destructive">
          {error}
        </p>
      </main>
    ) : (
      <AdminSkeleton />
    );
  const customPages = content.customPageDefinitions.filter(
    (item) => !item.archived,
  );
  const customId = customPageId(page);
  const pageTitle = customId
    ? (customPages.find((item) => item.id === customId)?.name ?? "Custom page")
    : pageLabels[page as PageKey];
  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-muted/30 text-foreground">
      <header className="z-40 shrink-0 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
          <div className="mr-auto">
            <p className="text-xs font-medium text-muted-foreground">
              XONE CMS · {email}
            </p>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <span
            className={`text-sm ${history.length ? "text-amber-700" : "text-emerald-700"}`}
            role="status"
          >
            {history.length ? "Unsaved changes" : "Saved"}
          </span>
          <button
            className="min-h-10 rounded-md border px-3 text-sm disabled:opacity-50"
            title="Undo the last change"
            disabled={!history.length}
            onClick={undo}
          >
            Undo
          </button>
          <button
            className="min-h-10 rounded-md border px-3 text-sm disabled:opacity-50"
            title="Redo the last undone change"
            disabled={!future.length}
            onClick={redo}
          >
            Redo
          </button>
          <button
            className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
            title="Save your draft and open its preview"
            disabled={busy}
            onClick={() => void saveDraft()}
          >
            Save draft
          </button>
          <button
            className="min-h-10 rounded-md border px-4 text-sm disabled:opacity-50"
            title="Publish the saved draft"
            disabled={busy || history.length > 0}
            onClick={() => void publish()}
          >
            Publish
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border px-3 text-sm"
            title="Sign out of the CMS"
            aria-label="Log out of Xone CMS"
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
          <div
            className="mx-auto mt-2 max-w-[1600px] text-sm"
            role={error ? "alert" : "status"}
          >
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-emerald-700">{message}</span>
            )}
          </div>
        )}
      </header>
      <div className="flex min-h-0 w-full flex-1 flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)_320px_360px]">
        <aside className="hidden min-h-0 overflow-hidden border-b bg-background p-4 lg:block lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Pages</h2>
            <button
              className="text-xs text-primary underline"
              title="Edit shared site settings"
              onClick={() => setPanel("settings")}
            >
              Site settings
            </button>
          </div>
          <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {pageKeys.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setPage(key);
                  setPanel("editor");
                  setSelectedBlockId(null);
                }}
                className={`min-h-10 rounded-md px-3 text-left text-sm ${page === key ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                title={`Edit the ${pageLabels[key]} page`}
              >
                {pageLabels[key]}
              </button>
            ))}
            {customPages.map((custom) => (
              <button
                key={custom.id}
                onClick={() => {
                  setPage(`custom:${custom.id}`);
                  setPanel("editor");
                  setSelectedBlockId(null);
                }}
                className={`min-h-10 rounded-md px-3 text-left text-sm ${page === `custom:${custom.id}` ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                title={`Edit the ${custom.name} page`}
              >
                {custom.name}
              </button>
            ))}
          </nav>
          <div className="mt-6 space-y-2 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New page
            </p>
            <input
              value={newPageName}
              onChange={(event) => setNewPageName(event.target.value)}
              placeholder="Page name"
              className="min-h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
            <input
              value={newPageSlug}
              onChange={(event) => setNewPageSlug(event.target.value)}
              placeholder="url-slug"
              className="min-h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
            <button
              onClick={addPage}
              className="min-h-10 w-full rounded-md border text-sm hover:bg-muted"
              title="Create a new page"
            >
              + Add page
            </button>
          </div>
        </aside>
        <div className="flex shrink-0 gap-1 border-b bg-background p-2 lg:hidden">
          {(["canvas", "edit", "add"] as const).map((workspace) => (
            <button
              key={workspace}
              type="button"
              onClick={() => setMobileWorkspace(workspace)}
              className={`min-h-10 flex-1 rounded-md px-3 text-sm capitalize ${mobileWorkspace === workspace ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title={`Show ${workspace === "add" ? "section tools" : `${workspace} workspace`}`}
              aria-pressed={mobileWorkspace === workspace}
            >
              {workspace === "add" ? "Add section" : workspace}
            </button>
          ))}
        </div>
        <section className={`min-h-0 min-w-0 flex-1 p-4 sm:p-6 ${mobileWorkspace === "canvas" ? "flex flex-col" : "hidden lg:flex lg:flex-col"}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Page canvas</h2>
              <p className="text-sm text-muted-foreground">
                Drag sections or use the arrow buttons. Click a section to edit
                it.
              </p>
            </div>
            <div className="flex rounded-md border bg-background p-1">
              {(["desktop", "tablet", "mobile"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setDevice(option)}
                  className={`min-h-9 rounded px-3 text-xs capitalize ${device === option ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  title={`Preview the responsive page at ${option} width`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overflow-x-auto rounded-3xl border bg-slate-200/70 p-3 shadow-inner"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleCanvasDrop}
          >
            <div
              className="mx-auto min-h-[600px] overflow-hidden rounded-2xl bg-background shadow-xl transition-[width] duration-200"
              style={{ width: deviceWidths[device], maxWidth: "100%" }}
            >
              <div className="border-b bg-xone-navy px-5 py-4 text-sm font-medium text-white">
                Draft preview · {pageTitle}
              </div>
              {publishedPage && (
                <div className="border-b bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current public page
                  </p>
                  <div className="max-h-[50rem] overflow-y-auto rounded-xl border bg-background" style={{ minHeight: device === "mobile" ? "844px" : device === "tablet" ? "1024px" : "900px" }}>
                    <CmsPageRenderer sections={publishedPage.sections} blocks={publishedPage.blocks} includePreflight={false} />
                  </div>
                </div>
              )}
              <div className="space-y-4 p-4">
                {currentPage?.sections.map((section, index) => (
                  <BuilderSection
                    key={section.id}
                    section={section}
                    index={index}
                    total={currentPage.sections.length}
                    selectedId={selectedBlockId}
                    onSelect={(element) => {
                      setSelectedBlockId(element.type === "block" ? element.block.id : element.id);
                      setPanel("editor");
                    }}
                    onChange={(next) => updatePageSections(currentPage.sections.map((item) => item.id === next.id ? next : item))}
                    onDuplicate={() => {
                      const copy = duplicateSection(section);
                      updatePageSections([...currentPage.sections.slice(0, index + 1), copy, ...currentPage.sections.slice(index + 1)]);
                      setSelectedBlockId(copy.rows[0]?.columns[0]?.elements[0]?.id ?? null);
                      setMobileWorkspace("edit");
                    }}
                    onMove={(nextIndex) => {
                      const sections = [...currentPage.sections];
                      const [moved] = sections.splice(index, 1);
                      sections.splice(nextIndex, 0, moved);
                      updatePageSections(sections);
                    }}
                    onDelete={() => updatePageSections(currentPage.sections.filter((item) => item.id !== section.id))}
                  />
                ))}
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center text-sm text-muted-foreground">
                  {currentPage?.sections.length
                    ? "Drop a section here to add it to the bottom"
                    : "This page is empty. Drop a section here or use Add section in the sidebar."}
                </div>
              </div>
            </div>
          </div>
        </section>
        <aside className={`min-h-0 overflow-y-auto border-t bg-background p-4 lg:border-l lg:border-t-0 ${mobileWorkspace === "add" ? "block" : "hidden lg:block"}`}>
          <AddSectionPanel onAdd={addBlock} onAddElement={addElement} />
        </aside>
        <aside className={`min-h-0 overflow-y-auto border-t bg-background p-4 lg:border-l lg:border-t-0 ${mobileWorkspace === "edit" ? "block" : "hidden lg:block"}`}>
          <div className="mb-4 flex rounded-md border p-1">
            <button
              onClick={() => setPanel("editor")}
              className={`min-h-10 flex-1 rounded text-sm ${panel === "editor" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Edit the selected section"
            >
              Edit
            </button>
            <button
              onClick={() => setPanel("settings")}
              className={`min-h-10 flex-1 rounded text-sm ${panel === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Edit shared site settings"
            >
              Site settings
            </button>
          </div>
          {panel === "settings" ? (
            <SiteSettings content={content} onChange={updateContent} />
          ) : selectedBlock ? (
            <BlockSettings block={selectedBlock} onChange={updateBlock} />
          ) : selectedElement ? (
            <BuilderElementSettings element={selectedElement} onChange={updateSelectedElement} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a section to edit its content and responsive settings.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

function EditorBlock({
  block,
  index,
  total,
  selected,
  onSelect,
  onMove,
  onDrop,
  onDuplicate,
  onDelete,
  onToggle,
}: {
  block: CmsBlock;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (index: number) => void;
  onDrop: (sourceIndex: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <article
      draggable
      onDragStart={(event) => {
        setDragging(true);
        event.dataTransfer.setData("text/plain", String(index));
      }}
      onDragEnd={() => setDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const source = Number(event.dataTransfer.getData("text/plain"));
        if (Number.isInteger(source)) onDrop(source);
      }}
      onClick={onSelect}
      className={`group relative rounded-xl border p-4 transition ${selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/60"} ${block.visible === false ? "opacity-50" : ""} ${dragging ? "opacity-40" : ""}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          aria-label={`Drag ${blockLabel(block)}`}
          title={`Drag ${blockLabel(block)} to move it`}
          className="cursor-grab touch-none rounded p-2 text-muted-foreground hover:bg-muted"
        >
          ⋮⋮
        </button>
        <span className="text-sm font-semibold">{blockLabel(block)}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Section {index + 1}
        </span>
        <button
          aria-label="Move section up"
          title="Move section up"
          disabled={index === 0}
          onClick={(event) => {
            event.stopPropagation();
            onMove(index - 1);
          }}
          className="rounded px-2 py-1 text-sm disabled:opacity-30"
        >
          ↑
        </button>
        <button
          aria-label="Move section down"
          title="Move section down"
          disabled={index === total - 1}
          onClick={(event) => {
            event.stopPropagation();
            onMove(index + 1);
          }}
          className="rounded px-2 py-1 text-sm disabled:opacity-30"
        >
          ↓
        </button>
        <button
          aria-label="Duplicate section"
          title="Duplicate section"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
          className="rounded px-2 py-1 text-sm"
        >
          ⧉
        </button>
        <button
          aria-label={block.visible === false ? "Show section" : "Hide section"}
          title={block.visible === false ? "Show section" : "Hide section"}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className="rounded px-2 py-1 text-sm"
        >
          {block.visible === false ? "○" : "◉"}
        </button>
        <button
          aria-label="Delete section"
          title="Delete section"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="rounded px-2 py-1 text-sm text-destructive"
        >
          ×
        </button>
      </div>
      <div className="pointer-events-none">
        <CmsPageRenderer blocks={[block]} includePreflight={false} />
      </div>
    </article>
  );
}

function BuilderSection({
  section,
  index,
  total,
  selectedId,
  onSelect,
  onChange,
  onDuplicate,
  onMove,
  onDelete,
}: {
  section: CmsBuilderSection;
  index: number;
  total: number;
  selectedId: string | null;
  onSelect: (element: CmsBuilderElement) => void;
  onChange: (section: CmsBuilderSection) => void;
  onDuplicate: () => void;
  onMove: (index: number) => void;
  onDelete: () => void;
}) {
  const patchElement = (elementId: string, next: CmsBuilderElement) => onChange({ ...section, rows: section.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, elements: column.elements.map((element) => element.id === elementId ? next : element) })) })) });
  return <article className="rounded-xl border bg-background p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <strong className="mr-auto text-sm">{section.label}</strong>
      <span className="text-xs text-muted-foreground">Section {index + 1}</span>
      <button type="button" aria-label="Move section up" title="Move section up" disabled={index === 0} onClick={() => onMove(index - 1)} className="rounded px-2 py-1 disabled:opacity-30">↑</button>
      <button type="button" aria-label="Move section down" title="Move section down" disabled={index === total - 1} onClick={() => onMove(index + 1)} className="rounded px-2 py-1 disabled:opacity-30">↓</button>
      <button type="button" aria-label="Duplicate section" title="Duplicate section" onClick={onDuplicate} className="rounded px-2 py-1">⧉</button>
      <button type="button" aria-label="Delete section" title="Delete section" onClick={onDelete} className="rounded px-2 py-1 text-destructive">×</button>
    </div>
    {section.rows.map((row, rowIndex) => <div key={row.id} className="space-y-3 rounded-lg border border-dashed p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><span className="mr-auto">Row {rowIndex + 1}</span><button type="button" title="Move row up" disabled={rowIndex === 0} onClick={() => onChange({ ...section, rows: section.rows.map((item, itemIndex) => itemIndex === rowIndex ? section.rows[rowIndex - 1] : itemIndex === rowIndex - 1 ? row : item) })} className="disabled:opacity-30">↑</button><button type="button" title="Move row down" disabled={rowIndex === section.rows.length - 1} onClick={() => onChange({ ...section, rows: section.rows.map((item, itemIndex) => itemIndex === rowIndex ? section.rows[rowIndex + 1] : itemIndex === rowIndex + 1 ? row : item) })} className="disabled:opacity-30">↓</button></div>
      <div className={`grid gap-3 ${row.columns.length === 1 ? "grid-cols-1" : row.columns.length === 2 ? "grid-cols-1 md:grid-cols-2" : row.columns.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"}`}>
        {row.columns.map((column, columnIndex) => <div key={column.id} className="min-h-20 space-y-2 rounded-md bg-muted/30 p-2">
          <div className="flex items-center text-[11px] text-muted-foreground"><span className="mr-auto">Column {columnIndex + 1}</span><button type="button" title="Move column left" disabled={columnIndex === 0} onClick={() => onChange({ ...section, rows: section.rows.map((item, itemIndex) => itemIndex === rowIndex ? { ...item, columns: item.columns.map((value, valueIndex) => valueIndex === columnIndex ? item.columns[columnIndex - 1] : valueIndex === columnIndex - 1 ? column : value) } : item) })} className="disabled:opacity-30">←</button><button type="button" title="Move column right" disabled={columnIndex === row.columns.length - 1} onClick={() => onChange({ ...section, rows: section.rows.map((item, itemIndex) => itemIndex === rowIndex ? { ...item, columns: item.columns.map((value, valueIndex) => valueIndex === columnIndex ? item.columns[columnIndex + 1] : valueIndex === columnIndex + 1 ? column : value) } : item) })} className="disabled:opacity-30">→</button></div>
          {column.elements.map((element, elementIndex) => <div key={element.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/x-xone-element", element.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const sourceId = event.dataTransfer.getData("text/x-xone-element"); const sourceIndex = column.elements.findIndex((item) => item.id === sourceId); if (sourceIndex < 0 || sourceIndex === elementIndex) return; const elements = [...column.elements]; const [moved] = elements.splice(sourceIndex, 1); elements.splice(elementIndex, 0, moved); onChange({ ...section, rows: section.rows.map((item, itemIndex) => itemIndex === rowIndex ? { ...item, columns: item.columns.map((value) => value.id === column.id ? { ...value, elements } : value) } : item) }); }}><BuilderElementEditor element={element} selected={selectedId === element.id || (element.type === "block" && selectedId === element.block.id)} onSelect={() => onSelect(element)} onChange={(next) => patchElement(element.id, next)} /></div>)}
        </div>)}
      </div>
    </div>)}
  </article>;
}

function BuilderElementEditor({ element, selected, onSelect, onChange }: { element: CmsBuilderElement; selected: boolean; onSelect: () => void; onChange: (element: CmsBuilderElement) => void }) {
  if (element.type === "block") return <button type="button" onClick={onSelect} className={`block w-full text-left ${selected ? "rounded-md ring-2 ring-primary" : ""}`}><span className="pointer-events-none block"><CmsPageRenderer blocks={[element.block]} includePreflight={false} /></span></button>;
  if (element.type === "image") return <div onClick={onSelect} className={`rounded-md border p-2 ${selected ? "ring-2 ring-primary" : ""}`}><img src={element.src} alt={element.alt} className="max-h-40 w-full object-contain" /></div>;
  if (element.type === "heading") return <input aria-label="Edit heading" value={element.text} onChange={(event) => onChange({ ...element, text: event.target.value })} onFocus={onSelect} className={`w-full bg-transparent text-2xl font-semibold outline-none ${selected ? "ring-2 ring-primary" : ""}`} />;
  if (element.type === "text") return <textarea aria-label="Edit text" value={element.text} onChange={(event) => onChange({ ...element, text: event.target.value })} onFocus={onSelect} rows={3} className={`w-full resize-y bg-transparent text-muted-foreground outline-none ${selected ? "ring-2 ring-primary" : ""}`} />;
  return <input aria-label={`Edit ${element.type} label`} value={element.label} onChange={(event) => onChange({ ...element, label: event.target.value })} onFocus={onSelect} className={`min-h-10 w-full rounded-md ${element.type === "button" ? "bg-primary px-4 text-primary-foreground" : "text-xone-violet underline"} outline-none ${selected ? "ring-2 ring-primary" : ""}`} />;
}

function BuilderElementSettings({ element, onChange }: { element: CmsBuilderElement; onChange: (element: CmsBuilderElement) => void }) {
  if (element.type === "text" || element.type === "heading") return <div className="space-y-4"><h2 className="font-semibold">Edit {element.type}</h2><TextField label="Text" value={element.text} onChange={(text) => onChange({ ...element, text })} />{element.type === "heading" && <label className="block text-sm font-medium">Level<select value={element.level} onChange={(event) => onChange({ ...element, level: event.target.value as typeof element.level })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option></select></label>}</div>;
  if (element.type === "image") return <div className="space-y-4"><h2 className="font-semibold">Edit image</h2><Field label="Image URL" value={element.src} onChange={(src) => onChange({ ...element, src })} /><Field label="Alt text" value={element.alt} onChange={(alt) => onChange({ ...element, alt })} /></div>;
  if (element.type === "button" || element.type === "link") return <div className="space-y-4"><h2 className="font-semibold">Edit {element.type}</h2><Field label="Label" value={element.label} onChange={(label) => onChange({ ...element, label })} /><Field label="Link" value={element.href} onChange={(href) => onChange({ ...element, href })} /></div>;
  return <BlockSettings block={element.block} onChange={(block) => onChange({ ...element, block })} />;
}

function AddSectionPanel({
  onAdd,
  onAddElement,
}: {
  onAdd: (type: AddableBlockType, componentKind?: CmsComponentKind) => void;
  onAddElement: (type: AddableElementType) => void;
}) {
  const addableNames = addableBlockTypes.filter((type) => type !== "component");
  const label = (value: string) => value.replace(/([A-Z])/g, " $1").trim();
  return (
    <section aria-labelledby="add-section-heading" className="space-y-6">
      <h2 id="add-section-heading" className="mb-3 text-sm font-semibold">
        Add section
      </h2>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic elements</h3>
        <div className="grid gap-2">
          {(["text", "heading", "image", "button", "link"] as const).map((type) => <button key={type} type="button" onClick={() => onAddElement(type)} className="min-h-10 rounded-md border bg-background px-3 text-left text-sm capitalize hover:bg-muted">+ {type}</button>)}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Existing blocks</h3>
        <div className="grid gap-2">
        {addableNames.map((type) => (
          <button
            key={type}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-xone-block", type);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(type)}
            className="min-h-10 rounded-md border bg-background px-3 text-left text-sm capitalize hover:bg-muted"
            title={`Add a ${type.replace("Collection", "").toLowerCase()} section, or drag it onto the canvas`}
          >
            + {label(type.replace("Collection", ""))}
          </button>
        ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Public components</h3>
        <div className="grid gap-2">
          {publicComponentKinds.map((kind) => (
            <button key={kind} type="button" onClick={() => onAdd("component", kind)} className="min-h-10 rounded-md border bg-background px-3 text-left text-sm hover:bg-muted">
              + {label(kind)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">UI components</h3>
        <div className="grid gap-2">
          {uiComponentKinds.map((kind) => (
            <button key={kind} type="button" onClick={() => onAdd("component", kind)} className="min-h-10 rounded-md border bg-background px-3 text-left text-sm hover:bg-muted">
              + {label(kind)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}...`}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"
      />
    </label>
  );
}
function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        value={value}
        placeholder={`Write ${label.toLowerCase()}...`}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-1 w-full rounded-md border bg-background p-3"
      />
    </label>
  );
}
function ColumnField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      Columns
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"
      >
        <option value={1}>1 column</option>
        <option value={2}>2 columns</option>
        <option value={3}>3 columns</option>
      </select>
    </label>
  );
}

function BlockSettings({
  block,
  onChange,
}: {
  block: CmsBlock;
  onChange: (block: CmsBlock) => void;
}) {
  const patch = (value: Partial<CmsBlock>) =>
    onChange({ ...block, ...value } as CmsBlock);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">{blockLabel(block)}</h2>
        <p className="text-xs text-muted-foreground">
          Changes appear in the canvas immediately.
        </p>
      </div>
      {block.type === "component" && (
        <>
          <label className="block text-sm font-medium">Component<select value={block.componentKind} onChange={(event) => patch({ componentKind: event.target.value as CmsComponentKind })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><optgroup label="Public components">{publicComponentKinds.map((kind) => <option key={kind} value={kind}>{kind.replace(/([A-Z])/g, " $1")}</option>)}</optgroup><optgroup label="UI components">{uiComponentKinds.map((kind) => <option key={kind} value={kind}>{kind.replace(/([A-Z])/g, " $1")}</option>)}</optgroup></select></label>
          <Field label="Heading" value={block.heading} onChange={(value) => patch({ heading: value })} />
          <TextField label="Body" value={block.body} onChange={(value) => patch({ body: value })} />
          <Field label="Button/label text" value={block.label} onChange={(value) => patch({ label: value })} />
          <Field label="Link" value={block.href ?? ""} onChange={(value) => patch({ href: value || undefined })} />
          <ColumnField value={Math.min(block.columns, 3)} onChange={(value) => patch({ columns: value })} />
          <label className="block text-sm font-medium">Alignment<select value={block.align} onChange={(event) => patch({ align: event.target.value as "left" | "center" | "right" })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="block text-sm font-medium">Spacing<select value={block.spacing} onChange={(event) => patch({ spacing: event.target.value as "compact" | "default" | "spacious" })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="compact">Compact</option><option value="default">Default</option><option value="spacious">Spacious</option></select></label>
          <VisualAssetField label="Section logo/icon" value={block.asset} onChange={(value) => patch({ asset: value })} />
          <VisualAssetField label="Section icon" value={block.icon} onChange={(value) => patch({ icon: value })} />
          <TextField label="Items (JSON)" value={JSON.stringify(block.items, null, 2)} onChange={(value) => { try { patch({ items: JSON.parse(value) as typeof block.items }); } catch { /* preserve valid data while editing */ } }} />
        </>
      )}
      {block.type === "hero" && (
        <>
          <Field
            label="Eyebrow"
            value={block.eyebrow ?? ""}
            onChange={(value) => patch({ eyebrow: value })}
          />
          <Field
            label="Heading"
            value={block.heading}
            onChange={(value) => patch({ heading: value })}
          />
          <TextField
            label="Body"
            value={block.body}
            onChange={(value) => patch({ body: value })}
          />
          <Field
            label="Button label"
            value={block.ctaLabel ?? ""}
            onChange={(value) => patch({ ctaLabel: value })}
          />
          <Field
            label="Button link"
            value={block.ctaHref ?? ""}
            onChange={(value) => patch({ ctaHref: value })}
          />
          <Field
            label="Image URL"
            value={block.imageSrc ?? ""}
            onChange={(value) => patch({ imageSrc: value })}
            placeholder="/assets/... or https://..."
          />
          <Field
            label="Image alt text"
            value={block.imageAlt ?? ""}
            onChange={(value) => patch({ imageAlt: value })}
          />
          <ColumnField
            value={block.columns}
            onChange={(value) => patch({ columns: value })}
          />
        </>
      )}
      {block.type === "text" && (
        <>
          <Field
            label="Heading"
            value={block.heading ?? ""}
            onChange={(value) => patch({ heading: value })}
          />
          <TextField
            label="Paragraphs (one per line)"
            value={block.paragraphs.join("\n")}
            onChange={(value) => patch({ paragraphs: value.split("\n") })}
          />
        </>
      )}
      {block.type === "cta" && (
        <>
          <Field
            label="Heading"
            value={block.heading}
            onChange={(value) => patch({ heading: value })}
          />
          <TextField
            label="Body"
            value={block.body}
            onChange={(value) => patch({ body: value })}
          />
          <Field
            label="Button label"
            value={block.label}
            onChange={(value) => patch({ label: value })}
          />
          <Field
            label="Link"
            value={block.href}
            onChange={(value) => patch({ href: value })}
          />
        </>
      )}
      {block.type === "contact" && (
        <>
          <Field
            label="Heading"
            value={block.heading}
            onChange={(value) => patch({ heading: value })}
          />
          <TextField
            label="Body"
            value={block.body}
            onChange={(value) => patch({ body: value })}
          />
          <Field
            label="Email"
            value={block.email}
            onChange={(value) => patch({ email: value })}
            type="email"
          />
          <Field label="Phone" value={block.phone} onChange={(value) => patch({ phone: value })} />
          <Field label="Location" value={block.location} onChange={(value) => patch({ location: value })} />
          <Field label="Secondary button label" value={block.secondaryLabel} onChange={(value) => patch({ secondaryLabel: value })} />
          <Field label="Secondary button link" value={block.secondaryHref} onChange={(value) => patch({ secondaryHref: value })} />
        </>
      )}
      {block.type === "preflight" && (
        <>
          <Field label="Logo URL" value={block.logoSrc} onChange={(value) => patch({ logoSrc: value })} />
          <Field label="Logo alt text" value={block.logoAlt} onChange={(value) => patch({ logoAlt: value })} />
          <TextField label="Objectives (one per line)" value={block.objectives.join("\n")} onChange={(value) => patch({ objectives: value.split("\n").filter(Boolean).slice(0, 3) })} />
          <TextField label="Reasons (title :: description, one per line)" value={block.reasons.map((item) => `${item.title} :: ${item.description}`).join("\n")} onChange={(value) => patch({ reasons: value.split("\n").filter(Boolean).map((item) => { const [title, ...description] = item.split("::"); return { title: title.trim(), description: description.join("::").trim() }; }) })} />
          <Field label="CTA label" value={block.ctaLabel} onChange={(value) => patch({ ctaLabel: value })} />
        </>
      )}
      {block.type === "processCollection" && (
        <>
          <Field label="Heading" value={block.heading} onChange={(value) => patch({ heading: value })} />
          <TextField label="Body" value={block.body} onChange={(value) => patch({ body: value })} />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Steps</h3>
            {block.items.map((item, index) => (
              <div key={`${block.id}-step-${index}`} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Step {index + 1}</span>
                  <button type="button" className="text-xs text-destructive" onClick={() => patch({ items: block.items.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
                </div>
                <Field label="Number" type="number" value={String(item.step)} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, step: Number(value) } : current) })} />
                <Field label="Title" value={item.title} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, title: value } : current) })} />
                <TextField label="Description" value={item.description} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, description: value } : current) })} />
                <VisualAssetField label="Step icon" value={item.icon} onChange={(icon) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, icon } : current) })} />
              </div>
            ))}
            <button type="button" className="text-xs text-primary underline" onClick={() => patch({ items: [...block.items, { step: block.items.length + 1, title: "New step", description: "Edit this content." }] })}>+ Add step</button>
          </div>
        </>
      )}
      {block.type === "teamCollection" && (
        <>
          <Field label="Heading" value={block.heading} onChange={(value) => patch({ heading: value })} />
          <TextField label="Body" value={block.body} onChange={(value) => patch({ body: value })} />
          <ColumnField value={block.columns} onChange={(value) => patch({ columns: value })} />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Members</h3>
            {block.items.map((member, index) => (
              <div key={`${block.id}-member-${index}`} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between"><span className="text-xs font-medium">Member {index + 1}</span><button type="button" className="text-xs text-destructive" onClick={() => patch({ items: block.items.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div>
                <Field label="Name" value={member.name} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, name: value } : current) })} />
                <Field label="Role" value={member.role} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, role: value } : current) })} />
                <Field label="Initials" value={member.initials} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, initials: value } : current) })} />
                <VisualAssetField label="Member photo" value={member.photo} onChange={(photo) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, photo } : current) })} />
                <Field label="Photo URL" value={member.photoSrc} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, photoSrc: value } : current) })} />
                <Field label="LinkedIn" value={member.linkedin ?? ""} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, linkedin: value || undefined } : current) })} />
                <Field label="GitHub" value={member.github ?? ""} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, github: value || undefined } : current) })} />
                <Field label="Portfolio" value={member.portfolio ?? ""} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index ? { ...current, portfolio: value || undefined } : current) })} />
              </div>
            ))}
            <button type="button" className="text-xs text-primary underline" onClick={() => patch({ items: [...block.items, { name: "New team member", role: "Edit this role.", initials: "NM", photoSrc: "" }] })}>+ Add member</button>
          </div>
        </>
      )}
      {block.type === "legal" && (
        <>
          <Field label="Title" value={block.title} onChange={(value) => patch({ title: value })} />
          <Field label="Last updated" value={block.lastUpdated} onChange={(value) => patch({ lastUpdated: value })} />
          <TextField label="Introduction" value={block.intro} onChange={(value) => patch({ intro: value })} />
          <TextField label="Sections (JSON)" value={JSON.stringify(block.sections, null, 2)} onChange={(value) => { try { patch({ sections: JSON.parse(value) as typeof block.sections }); } catch { /* keep the last valid value while editing */ } }} />
        </>
      )}
      {block.type === "cards" && (
        <CollectionSettings block={block} onChange={onChange} kind="cards" />
      )}
      {block.type === "projectCollection" && (
        <>
          <CollectionSettings block={block} onChange={onChange} kind="projects" />
          <label className="block text-sm font-medium">Display<select value={block.display} onChange={(event) => onChange({ ...block, display: event.target.value as "grid" | "carousel" })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="grid">Grid</option><option value="carousel">Carousel</option></select></label>
        </>
      )}
      {block.type === "serviceCollection" && (
        <CollectionSettings block={block} onChange={onChange} kind="services" />
      )}
      {block.type === "footer" && (
        <>
          <TextField
            label="Description"
            value={block.description}
            onChange={(value) => patch({ description: value })}
          />
          <TextField
            label="Links (label | href, one per line)"
            value={block.links
              .map((link) => `${link.label} | ${link.href}`)
              .join("\n")}
            onChange={(value) =>
              patch({
                links: value
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => {
                    const [label, href] = line.split("|");
                    return {
                      label: label?.trim() ?? "",
                      href: href?.trim() ?? "",
                    };
                  }),
              })
            }
          />
        </>
      )}
    </div>
  );
}

function VisualAssetField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: CmsVisualAsset;
  onChange: (value: CmsVisualAsset | undefined) => void;
}) {
  const [uploadError, setUploadError] = useState("");
  const source = value?.source ?? "library";
  const updateLibrary = (changes: Partial<Extract<CmsVisualAsset, { source: "library" }>>) =>
    onChange({ source: "library", name: "star", variant: "solid", ...value, ...changes } as CmsVisualAsset);
  const updateUpload = (changes: Partial<Extract<CmsVisualAsset, { source: "upload" }>>) =>
    onChange({ source: "upload", assetId: "", src: "", alt: "", ...value, ...changes } as CmsVisualAsset);
  async function upload(file: File): Promise<void> {
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: form });
    const payload = (await response.json()) as { assetId?: string; src?: string; alt?: string; error?: string };
    if (!response.ok || !payload.assetId || !payload.src) {
      setUploadError(payload.error ?? "Unable to upload asset");
      return;
    }
    onChange({ source: "upload", assetId: payload.assetId, src: payload.src, alt: payload.alt ?? file.name });
  }
  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">{label}</p>
      <label className="block text-sm font-medium">Source<select value={source} onChange={(event) => event.target.value === "library" ? updateLibrary({}) : updateUpload({})} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="library">Icon library</option><option value="upload">Uploaded asset</option></select></label>
      {source === "library" ? <>
        <label className="block text-sm font-medium">Icon<select value={value?.source === "library" ? value.name : "star"} onChange={(event) => updateLibrary({ name: event.target.value })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="star">Star</option><option value="check">Check</option><option value="arrow">Arrow</option><option value="quote">Quote</option><option value="cog">Cog</option><option value="palette">Palette</option><option value="globe">Globe</option><option value="mobile">Mobile</option></select></label>
        <Field label="Color" value={value?.source === "library" ? value.color ?? "currentColor" : "currentColor"} onChange={(color) => updateLibrary({ color })} />
        <Field label="Size (px)" type="number" value={String(value?.source === "library" ? value.size ?? 28 : 28)} onChange={(size) => updateLibrary({ size: Number(size) })} />
        <label className="block text-sm font-medium">Style<select value={value?.source === "library" ? value.variant : "solid"} onChange={(event) => updateLibrary({ variant: event.target.value as "solid" | "outline" })} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="solid">Solid</option><option value="outline">Outline</option></select></label>
      </> : <>
        <label className="block text-sm font-medium">Upload<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="mt-1 block w-full text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>
        <Field label="Asset URL" value={value?.source === "upload" ? value.src : ""} onChange={(src) => updateUpload({ src })} />
        <Field label="Alt text" value={value?.source === "upload" ? value.alt : ""} onChange={(alt) => updateUpload({ alt })} />
        {uploadError && <p role="alert" className="text-xs text-destructive">{uploadError}</p>}
      </>}
    </div>
  );
}

function ServiceIconField({
  value,
  onChange,
}: {
  value: "cog" | "palette" | "globe" | "mobile" | CmsVisualAsset;
  onChange: (value: "cog" | "palette" | "globe" | "mobile" | CmsVisualAsset) => void;
}) {
  if (typeof value !== "string") {
    return <VisualAssetField label="Service icon" value={value} onChange={(next) => onChange(next ?? { source: "library", name: "star", variant: "solid" })} />;
  }
  return <div className="space-y-2"><label className="block text-sm font-medium">Icon<select value={value} onChange={(event) => onChange(event.target.value as typeof value)} className="mt-1 min-h-10 w-full rounded-md border bg-background px-3"><option value="cog">Cog</option><option value="palette">Palette</option><option value="globe">Globe</option><option value="mobile">Mobile</option></select></label><button type="button" className="text-xs text-primary underline" onClick={() => onChange({ source: "library", name: value, color: "#533bda", size: 28, variant: "solid" })}>Customize color and size</button></div>;
}

function CollectionSettings({
  block,
  onChange,
  kind,
}: {
  block: Extract<
    CmsBlock,
    { type: "cards" | "projectCollection" | "serviceCollection" }
  >;
  onChange: (block: CmsBlock) => void;
  kind: "cards" | "projects" | "services";
}) {
  const patch = (value: Partial<typeof block> | { items: unknown }) =>
    onChange({ ...block, ...value } as CmsBlock);
  const moveItem = (from: number, to: number): void => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= block.items.length ||
      to >= block.items.length
    )
      return;
    const items = [...block.items];
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    patch({ items });
  };
  return (
    <div className="space-y-4">
      <Field
        label="Heading"
        value={block.heading ?? ""}
        onChange={(value) => patch({ heading: value })}
      />
      {kind === "projects" && "body" in block && <TextField label="Body" value={block.body} onChange={(value) => patch({ body: value })} />}
      <ColumnField
        value={block.columns}
        onChange={(value) => patch({ columns: value })}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Items</h3>
          <button
            onClick={() =>
              patch({
                items: [
                  ...block.items,
                  kind === "services"
                    ? {
                        title: "New service",
                        description: "Edit this content.",
                        icon: "cog" as const,
                        highlights: [],
                      }
                    : kind === "projects"
                      ? {
                          id: createClientId(),
                          title: "New project",
                          description: "Edit this content.",
                          challenge: "",
                          outcomes: [],
                          category: "web-app" as const,
                          leadEngineer: "",
                          teamCredits: [],
                          liveLinkLabel: "View live site",
                          previewImageSrc: "",
                          tags: [],
                        }
                      : {
                          title: "New card",
                          description: "Edit this content.",
                        },
                ],
              })
            }
            className="text-xs text-primary underline"
            title={`Add another ${kind === "services" ? "service" : kind === "projects" ? "project" : "card"}`}
          >
            + Add item
          </button>
        </div>
        {block.items.map((item, index) => (
          <div
            key={"id" in item ? item.id : index}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(
                "application/x-xone-item",
                String(index),
              );
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const source = Number(
                event.dataTransfer.getData("application/x-xone-item"),
              );
              if (Number.isInteger(source)) moveItem(source, index);
            }}
            className="space-y-2 rounded-md border p-3"
          >
            <div className="flex justify-between">
              <span
                className="cursor-grab text-xs font-medium"
                title="Drag to reorder this item"
              >
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => patch({ items: [...block.items.slice(0, index + 1), { ...item, ...("id" in item ? { id: `${item.id}-copy-${createClientId()}` } : {}) }, ...block.items.slice(index + 1)] })}
                className="text-xs text-primary"
                title={`Duplicate item ${index + 1}`}
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({
                    items: block.items.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
                className="text-xs text-destructive"
                title={`Remove item ${index + 1}`}
              >
                Remove
              </button>
            </div>
            <Field
              label="Title"
              value={item.title}
              onChange={(value) =>
                patch({
                  items: block.items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, title: value }
                      : current,
                  ),
                })
              }
            />
            <TextField
              label="Description"
              value={item.description}
              onChange={(value) =>
                patch({
                  items: block.items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, description: value }
                      : current,
                  ),
                })
              }
            />
            {"highlights" in item && (
              <>
                {"icon" in item && <ServiceIconField value={item.icon} onChange={(icon) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "icon" in current ? { ...current, icon } : current) })} />}
                <TextField label="Highlights (one per line)" value={item.highlights.join("\n")} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "highlights" in current ? { ...current, highlights: value.split("\n") } : current) })} />
              </>
            )}
            {kind === "projects" && (
              <Field
                label="Project link"
                value={"href" in item ? item.href ?? "" : ""}
                onChange={(value) =>
                  patch({
                    items: block.items.map((current, itemIndex) =>
                      itemIndex === index
                        ? { ...current, href: value || undefined }
                        : current,
                    ),
                  })
                }
              />
            )}
            {kind === "projects" && (
              <Field
                label="Live link"
                value={"liveHref" in item ? item.liveHref ?? "" : ""}
                onChange={(value) =>
                  patch({
                    items: block.items.map((current, itemIndex) =>
                      itemIndex === index
                        ? { ...current, liveHref: value || undefined }
                        : current,
                    ),
                  })
                }
              />
            )}
            {"imageSrc" in item && (
              <>
                <Field
                  label="Image URL"
                  value={item.imageSrc ?? ""}
                  onChange={(value) =>
                    patch({
                      items: block.items.map((current, itemIndex) =>
                        itemIndex === index && "imageSrc" in current
                          ? { ...current, imageSrc: value }
                          : current,
                      ),
                    })
                  }
                />
                {"image" in item && <VisualAssetField label="Image asset" value={item.image} onChange={(image) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "image" in current ? { ...current, image } : current) })} />}
              </>
            )}
            {"icon" in item && kind === "cards" && typeof item.icon !== "string" && (
              <VisualAssetField
                label="Card icon"
                value={item.icon}
                onChange={(icon) =>
                  patch({
                    items: block.items.map((current, itemIndex) =>
                      itemIndex === index && "icon" in current
                        ? { ...current, icon }
                        : current,
                    ),
                  })
                }
              />
            )}
            {"summary" in item && (
              <>
                <TextField label="Summary" value={item.summary ?? item.description} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "summary" in current ? { ...current, summary: value, description: value } : current) })} />
                <TextField label="Challenge" value={item.challenge} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "challenge" in current ? { ...current, challenge: value } : current) })} />
                <TextField label="Outcomes (one per line)" value={item.outcomes.join("\n")} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "outcomes" in current ? { ...current, outcomes: value.split("\n") } : current) })} />
                <Field label="Category" value={item.category} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "category" in current ? { ...current, category: value } : current) })} />
                <Field label="Live link label" value={item.liveLinkLabel} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "liveLinkLabel" in current ? { ...current, liveLinkLabel: value } : current) })} />
                <TextField label="Tags (one per line)" value={item.tags.join("\n")} onChange={(value) => patch({ items: block.items.map((current, itemIndex) => itemIndex === index && "tags" in current ? { ...current, tags: value.split("\n") } : current) })} />
              </>
            )}
          </div>
        ))}
        {block.items.length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No items yet. Add one above, then drag items to reorder them.
          </div>
        )}
      </div>
    </div>
  );
}

function SiteSettings({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  const patch = (value: Partial<SiteContent["settings"]>) =>
    onChange({ ...content, settings: { ...content.settings, ...value } });
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">Site settings</h2>
        <p className="text-xs text-muted-foreground">
          These settings apply across the published site.
        </p>
      </div>
      <Field
        label="Site name"
        value={content.settings.siteName}
        onChange={(value) => patch({ siteName: value })}
      />
      <Field
        label="Contact email"
        value={content.settings.contactEmail}
        onChange={(value) => patch({ contactEmail: value })}
        type="email"
      />
      <Field
        label="Logo URL"
        value={content.settings.logoUrl}
        onChange={(value) => patch({ logoUrl: value })}
      />
      <Field
        label="Primary color"
        value={content.settings.primaryColor}
        onChange={(value) => patch({ primaryColor: value })}
      />
      <Field
        label="Accent color"
        value={content.settings.accentColor}
        onChange={(value) => patch({ accentColor: value })}
      />
      <Field
        label="Default SEO title"
        value={content.settings.defaultTitle}
        onChange={(value) => patch({ defaultTitle: value })}
      />
      <TextField
        label="Default SEO description"
        value={content.settings.defaultDescription}
        onChange={(value) => patch({ defaultDescription: value })}
      />
      <TextField
        label="Navigation (label | href | visible, one per line)"
        value={content.settings.navLinks.map((link) => `${link.label} | ${link.href} | ${link.visible}`).join("\n")}
        onChange={(value) => patch({ navLinks: value.split("\n").filter(Boolean).map((line) => { const [label, href, visible] = line.split("|"); return { label: label?.trim() ?? "", href: href?.trim() ?? "/", visible: visible?.trim() !== "false" }; }) })}
      />
    </div>
  );
}
