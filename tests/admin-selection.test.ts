import { describe, expect, it } from "vitest";

import {
  locateBlock,
  locateCollectionItem,
  type EditorSelection,
} from "@/features/admin/lib/builder";
import { defaultContent, parseSiteContent } from "@/features/admin/lib/content";

describe("focused CMS selections", () => {
  it("locates only the selected project item", () => {
    const page = parseSiteContent(defaultContent).pages.home;
    const block = locateBlock(page, "home-projects");
    if (
      !block ||
      block.kind !== "element" ||
      !("type" in block.node) ||
      block.node.type !== "block"
    )
      throw new Error("Expected the home project collection");

    const selection: EditorSelection = {
      type: "item",
      blockId: "home-projects",
      index: 1,
    };
    const selected = locateCollectionItem(page, selection);

    if (block.node.block.type !== "projectCollection")
      throw new Error("Expected the project collection block");
    expect(selected?.item).toMatchObject({ id: block.node.block.items[1]?.id });
    expect(selected?.index).toBe(1);
  });

  it("keeps item styles separate from collection styles", () => {
    const content = structuredClone(defaultContent);
    const projects = content.pages.home.blocks.find(
      (block) => block.id === "home-projects",
    );
    if (!projects || projects.type !== "projectCollection")
      throw new Error("Expected the home project collection");

    projects.items[0] = {
      ...projects.items[0],
      styles: { desktop: { color: "#123456", fontSize: 18 } },
    };
    const parsed = parseSiteContent(content);

    const parsedProjects = parsed.pages.home.blocks.find(
      (block) => block.id === "home-projects",
    );
    expect(parsedProjects?.type).toBe("projectCollection");
    if (parsedProjects?.type !== "projectCollection") return;
    expect(parsedProjects.items[0]?.styles).toEqual({
      desktop: { color: "#123456", fontSize: 18 },
    });
  });
});
