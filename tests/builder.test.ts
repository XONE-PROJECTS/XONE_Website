import { describe, expect, it } from "vitest";
import { cloneNode, locate, moveNode } from "@/features/admin/lib/builder";
import { defaultContent, parseSiteContent } from "@/features/admin/lib/content";
import {
  fontFamilySchema,
  responsiveCss,
  resolveStyle,
  textSizePresets,
} from "@/features/admin/lib/design";

describe("visual builder helpers", () => {
  it("moves sections without changing their contents", () => {
    const page = parseSiteContent(defaultContent).pages.home;
    const first = page.sections[0];
    const second = page.sections[1];
    if (!first || !second) throw new Error("Expected two home sections");

    const moved = moveNode(page, second.id, null, first.id);

    expect(moved.sections.map((section) => section.id)).toEqual([
      second.id,
      first.id,
      ...page.sections.slice(2).map((section) => section.id),
    ]);
    expect(locate(moved, first.id)?.node).toEqual(first);
  });

  it("clones a node with a new identity", () => {
    const page = parseSiteContent(defaultContent).pages.home;
    const section = page.sections[0];
    if (!section) throw new Error("Expected a home section");

    const copy = cloneNode(section);

    expect(copy.id).not.toBe(section.id);
    expect(copy.rows[0]?.id).not.toBe(section.rows[0]?.id);
    expect(copy.rows[0]?.columns[0]?.elements[0]?.id).not.toBe(
      section.rows[0]?.columns[0]?.elements[0]?.id,
    );
  });

  it("inherits desktop and tablet styles into mobile", () => {
    expect(
      resolveStyle(
        {
          desktop: { padding: 24, fontSize: 18 },
          tablet: { padding: 16 },
          mobile: { fontSize: 15 },
        },
        "mobile",
      ),
    ).toMatchObject({ padding: 16, fontSize: 15 });
    expect(
      resolveStyle(
        { desktop: { padding: 24, fontSize: 18 }, tablet: { padding: 16 } },
        "mobile",
      ),
    ).toMatchObject({ padding: 16, fontSize: 18 });
  });

  it("validates safe text fonts and emits responsive typography CSS", () => {
    expect(fontFamilySchema.options).toEqual([
      "geist",
      "system",
      "serif",
      "mono",
    ]);
    expect(fontFamilySchema.safeParse("serif").success).toBe(true);
    expect(fontFamilySchema.safeParse("Comic Sans").success).toBe(false);
    expect(
      responsiveCss("text-block", {
        desktop: { fontFamily: "serif", fontSize: textSizePresets.large },
        mobile: { fontSize: textSizePresets.small },
      }),
    ).toContain("font-family:ui-serif,Georgia,serif;font-size:20px");
    expect(
      responsiveCss("text-block", {
        mobile: { fontSize: textSizePresets.small },
      }),
    ).toContain("font-size:14px");
  });
});
