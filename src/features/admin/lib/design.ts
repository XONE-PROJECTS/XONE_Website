import { z } from "zod";

export const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value === "" ||
      (/^\/(?!\/)/.test(value) && !/[\\\u0000-\u0020]/.test(value)) ||
      /^https?:\/\/[^\s\\]+$/i.test(value),
    "Use a local image path or HTTP(S) URL",
  );
export const linkSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      !/[\\\u0000-\u0020]/.test(value) &&
      (/^\/(?!\/)/.test(value) ||
        /^https?:\/\//i.test(value) ||
        /^mailto:[^@]+@[^@]+/i.test(value) ||
        /^tel:\+?[\d()-]+$/.test(value)),
    "Use a local path, HTTP(S), email, or phone link",
  );
export const fontFamilyValues = ["geist", "system", "serif", "mono"] as const;
export const fontFamilySchema = z.enum(fontFamilyValues);
export type CmsFontFamily = z.infer<typeof fontFamilySchema>;
export const fontFamilyOptions: readonly {
  value: CmsFontFamily;
  label: string;
}[] = [
  { value: "geist", label: "Geist Sans" },
  { value: "system", label: "System Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
];
export const textSizePresets = {
  small: 14,
  body: 16,
  large: 20,
  display: 28,
} as const;

export const styleSchema = z
  .object({
    backgroundColor: colorSchema.optional(),
    backgroundImage: imageUrlSchema.optional(),
    color: colorSchema.optional(),
    fontFamily: fontFamilySchema.optional(),
    padding: z.number().min(0).max(240).optional(),
    margin: z.number().min(0).max(240).optional(),
    gap: z.number().min(0).max(120).optional(),
    width: z.number().min(1).max(100).optional(),
    maxWidth: z.number().min(120).max(2400).optional(),
    fontSize: z.number().min(10).max(160).optional(),
    fontWeight: z.enum(["400", "500", "600", "700", "800"]).optional(),
    lineHeight: z.number().min(1).max(3).optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    columns: z.number().int().min(1).max(4).optional(),
    columnWidths: z.array(z.number().min(1).max(12)).min(1).max(4).optional(),
    borderWidth: z.number().min(0).max(12).optional(),
    borderColor: colorSchema.optional(),
    radius: z.number().min(0).max(120).optional(),
    shadow: z.enum(["none", "small", "medium", "large"]).optional(),
    hidden: z.boolean().optional(),
    objectFit: z.enum(["cover", "contain"]).optional(),
  })
  .strict();
export const responsiveStyleSchema = z
  .object({
    desktop: styleSchema.optional(),
    tablet: styleSchema.optional(),
    mobile: styleSchema.optional(),
  })
  .strict();
export type CmsStyle = z.infer<typeof styleSchema>;
export type ResponsiveStyle = z.infer<typeof responsiveStyleSchema>;
export type Device = "desktop" | "tablet" | "mobile";

export const themeSchema = z.object({
  background: colorSchema.default("#ffffff"),
  foreground: colorSchema.default("#1a1a2e"),
  muted: colorSchema.default("#64748b"),
  section: colorSchema.default("#e6eaf0"),
  card: colorSchema.default("#f1effc"),
  bodySize: z.number().min(12).max(32).default(16),
  headingSize: z.number().min(20).max(96).default(36),
  bodyWeight: z.enum(["400", "500", "600"]).default("400"),
  headingWeight: z.enum(["500", "600", "700", "800"]).default("700"),
  lineHeight: z.number().min(1).max(2.5).default(1.5),
});
export const seoSchema = z.object({
  title: z.string().trim().max(160).default(""),
  description: z.string().trim().max(320).default(""),
  noIndex: z.boolean().default(false),
});

export function resolveStyle(
  style: ResponsiveStyle | undefined,
  device: Device,
): CmsStyle {
  return {
    ...style?.desktop,
    ...(device !== "desktop" ? style?.tablet : {}),
    ...(device === "mobile" ? style?.mobile : {}),
  };
}

function declarations(style: CmsStyle): string {
  const fontFamily =
    style.fontFamily === "geist"
      ? '"Geist Variable",ui-sans-serif,system-ui,sans-serif'
      : style.fontFamily === "system"
        ? "ui-sans-serif,system-ui,sans-serif"
        : style.fontFamily === "serif"
          ? "ui-serif,Georgia,serif"
          : style.fontFamily === "mono"
            ? "ui-monospace,SFMono-Regular,monospace"
            : undefined;
  const values: Record<string, string | number | undefined> = {
    "--cms-bg": style.backgroundColor,
    "--cms-color": style.color,
    "--cms-size":
      style.fontSize === undefined ? undefined : `${style.fontSize}px`,
    "--cms-weight": style.fontWeight,
    "--cms-leading": style.lineHeight,
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontFamily,
    padding: style.padding === undefined ? undefined : `${style.padding}px`,
    margin: style.margin === undefined ? undefined : `${style.margin}px`,
    gap: style.gap === undefined ? undefined : `${style.gap}px`,
    width: style.width === undefined ? undefined : `${style.width}%`,
    maxWidth: style.maxWidth === undefined ? undefined : `${style.maxWidth}px`,
    fontSize: style.fontSize === undefined ? undefined : `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    textAlign: style.align,
    borderWidth:
      style.borderWidth === undefined ? undefined : `${style.borderWidth}px`,
    borderStyle: style.borderWidth === undefined ? undefined : "solid",
    borderColor: style.borderColor,
    borderRadius: style.radius === undefined ? undefined : `${style.radius}px`,
    boxShadow:
      style.shadow === undefined
        ? undefined
        : {
            none: "none",
            small: "0 1px 3px #0002",
            medium: "0 4px 12px #0002",
            large: "0 12px 32px #0003",
          }[style.shadow],
    display:
      style.hidden === undefined ? undefined : style.hidden ? "none" : "revert",
    gridTemplateColumns: style.columns
      ? `repeat(${style.columns},minmax(0,1fr))`
      : style.columnWidths?.map((value) => `minmax(0,${value}fr)`).join(" "),
    backgroundImage: style.backgroundImage
      ? `url(${JSON.stringify(style.backgroundImage)})`
      : undefined,
    backgroundSize: style.backgroundImage ? "cover" : undefined,
    "--cms-fit": style.objectFit,
  };
  return Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`,
    )
    .join(";");
}

export function responsiveCss(
  id: string,
  styles: ResponsiveStyle | undefined,
): string {
  if (!styles) return "";
  // Escape the identifier as a CSS string; content can never escape its own selector.
  const selector = `[data-cms-id=${JSON.stringify(id).replace(/</g, "\\3c ")}]`;
  return `${selector}{${declarations(styles.desktop ?? {})}}@media(max-width:1023px){${selector}{${declarations(styles.tablet ?? {})}}}@media(max-width:639px){${selector}{${declarations(styles.mobile ?? {})}}}`;
}
