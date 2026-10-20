import type { CmsBlock, CmsBuilderColumn, CmsBuilderElement, CmsBuilderRow, CmsBuilderSection, CmsPageContent, PageKey, SiteContent } from "./content";

export type SelectedPage = PageKey | `custom:${string}`;
export type BuilderNode = CmsBuilderSection | CmsBuilderRow | CmsBuilderColumn | CmsBuilderElement;
export type NodeKind = "section" | "row" | "column" | "element";
export type LocatedNode = { kind: NodeKind; node: BuilderNode; parent: string | null; siblings: BuilderNode[]; index: number };
export const uid = (): string => globalThis.crypto.randomUUID();
export function getPage(content: SiteContent, page: SelectedPage): CmsPageContent { return page.startsWith("custom:") ? content.customPages[page.slice(7)] ?? { blocks: [], sections: [] } : content.pages[page as PageKey]; }
export function replacePage(content: SiteContent, selection: SelectedPage, page: CmsPageContent): SiteContent {
  const blocks = page.sections.flatMap(section => section.rows.flatMap(row => row.columns.flatMap(column => column.elements.flatMap(element => element.type === "block" ? [element.block] : []))));
  const next = { ...page, blocks };
  return selection.startsWith("custom:") ? { ...content, customPages: { ...content.customPages, [selection.slice(7)]: next } } : { ...content, pages: { ...content.pages, [selection]: next } };
}
export function locate(page: CmsPageContent, id: string | null): LocatedNode | null {
  if (!id) return null;
  const visit = (nodes: BuilderNode[], kind: NodeKind, parent: string | null): LocatedNode | null => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (node.id === id) return { kind, node, parent, siblings: nodes, index };
      const child = "rows" in node ? visit(node.rows, "row", node.id) : "columns" in node ? visit(node.columns, "column", node.id) : "elements" in node ? visit(node.elements, "element", node.id) : null;
      if (child) return child;
    }
    return null;
  };
  return visit(page.sections, "section", null);
}
export function cloneNode<T extends BuilderNode>(node: T): T {
  const copy = structuredClone(node); copy.id = uid();
  if ("rows" in copy) copy.rows = copy.rows.map(cloneNode);
  else if ("columns" in copy) copy.columns = copy.columns.map(cloneNode);
  else if ("elements" in copy) copy.elements = copy.elements.map(cloneNode);
  else if (copy.type === "block") copy.block.id = uid();
  return copy;
}
export function moveNode(page: CmsPageContent, id: string, parent: string | null, before: string | null = null): CmsPageContent {
  const draft = structuredClone(page), source = locate(draft, id);
  if (!source || before === id) return page;
  const target = parent ? locate(draft, parent)?.node : null;
  const destination: BuilderNode[] | undefined = source.kind === "section" && parent === null ? draft.sections : source.kind === "row" && target && "rows" in target ? target.rows : source.kind === "column" && target && "columns" in target ? target.columns : source.kind === "element" && target && "elements" in target ? target.elements : undefined;
  if (!destination || (source.siblings !== destination && source.siblings.length === 1 && (source.kind === "row" || source.kind === "column"))) return page;
  const limit = source.kind === "section" ? 40 : source.kind === "row" ? 20 : source.kind === "column" ? 4 : 40;
  if (source.siblings !== destination && destination.length >= limit) return page;
  source.siblings.splice(source.index, 1);
  const index = before ? destination.findIndex(node => node.id === before) : -1;
  destination.splice(index < 0 ? destination.length : index, 0, source.node);
  return draft;
}
export function emptyColumn(): CmsBuilderColumn { return { id: uid(), elements: [] }; }
export function emptyRow(): CmsBuilderRow { return { id: uid(), columns: [emptyColumn()] }; }
export function emptySection(): CmsBuilderSection { return { id: uid(), label: "New section", visible: true, rows: [emptyRow()] }; }
export function blockElement(block: CmsBlock): CmsBuilderElement { return { id: uid(), type: "block", block: { ...block, id: uid() } }; }
