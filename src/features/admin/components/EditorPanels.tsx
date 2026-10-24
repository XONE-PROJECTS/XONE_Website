"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  fontFamilyOptions,
  resolveStyle,
  textSizePresets,
  themeSchema,
  type CmsStyle,
  type Device,
  type ResponsiveStyle,
} from "../lib/design";
import type { SiteContent, SiteSettings as Settings } from "../lib/content";
import { SiteSettings, VisualAssetField } from "./EditorFields";

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
export function StyleFields({
  styles,
  device,
  onChange,
  tab,
  typography = false,
}: {
  styles?: ResponsiveStyle;
  device: Device;
  onChange: (styles: ResponsiveStyle) => void;
  tab: "layout" | "style";
  typography?: boolean;
}) {
  const explicit = styles?.[device] ?? {},
    resolved = resolveStyle(styles, device);
  function patch(value: Partial<CmsStyle>): void {
    const next = { ...explicit, ...value };
    onChange({ ...styles, [device]: next });
  }
  const number = (
    key: keyof CmsStyle,
    label: string,
    min: number,
    max: number,
    step = 1,
  ) => (
    <label key={key} className="block text-sm">
      <span>
        {label}
        {device !== "desktop" && explicit[key] === undefined
          ? " · inherited"
          : ""}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={typeof resolved[key] === "number" ? String(resolved[key]) : ""}
        placeholder="Default"
        onChange={(event) =>
          patch({
            [key]:
              event.target.value === ""
                ? undefined
                : Math.max(min, Math.min(max, Number(event.target.value))),
          })
        }
      />
    </label>
  );
  const sizePreset =
    resolved.fontSize === undefined
      ? ""
      : (Object.entries(textSizePresets).find(
          ([, size]) => size === resolved.fontSize,
        )?.[0] ?? "custom");
  const color = (
    key:
      | "backgroundColor"
      | "color"
      | "buttonBackgroundColor"
      | "buttonTextColor"
      | "borderColor",
    label: string,
  ) => (
    <div key={key} className="grid grid-cols-[1fr_44px] items-end gap-2">
      <TextInput
        label={label}
        value={resolved[key] ?? ""}
        onChange={(value) => patch({ [key]: value || undefined })}
      />
      <input
        aria-label={`${label} picker`}
        type="color"
        value={resolved[key] ?? "#ffffff"}
        onChange={(event) => patch({ [key]: event.target.value })}
      />
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {device} {tab}
        </p>
        <button
          type="button"
          className="text-xs underline"
          onClick={() => {
            const next = { ...styles };
            delete next[device];
            onChange(next);
          }}
        >
          Reset {device === "desktop" ? "styles" : "override"}
        </button>
      </div>
      {tab === "layout" ? (
        <>
          {number("padding", "Padding (px)", 0, 240)}
          {number("margin", "Margin (px)", 0, 240)}
          {number("gap", "Gap (px)", 0, 120)}
          {number("width", "Width (%)", 1, 100)}
          {number("maxWidth", "Maximum width (px)", 120, 2400)}
          {number("columns", "Columns", 1, 4)}
          <TextInput
            label="Column proportions (e.g. 2, 1)"
            value={resolved.columnWidths?.join(", ") ?? ""}
            onChange={(value) => {
              const values = value.split(",").map(Number);
              if (value === "") patch({ columnWidths: undefined });
              else if (
                values.length <= 4 &&
                values.every((item) => item >= 1 && item <= 12)
              )
                patch({ columnWidths: values });
            }}
          />
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={resolved.hidden ?? false}
              onChange={(event) => patch({ hidden: event.target.checked })}
            />
            Hide on {device}
          </label>
        </>
      ) : (
        <>
          {color("backgroundColor", "Background")}
          {color("color", "Text color")}
          {color("buttonBackgroundColor", "Button background")}
          {color("buttonTextColor", "Button text")}
          <TextInput
            label="Background image URL"
            value={resolved.backgroundImage ?? ""}
            onChange={(value) => patch({ backgroundImage: value || undefined })}
          />
          {typography && (
            <>
              <label className="block text-sm">
                Font family
                <select
                  value={resolved.fontFamily ?? ""}
                  onChange={(event) =>
                    patch({
                      fontFamily: (event.target.value ||
                        undefined) as CmsStyle["fontFamily"],
                    })
                  }
                >
                  <option value="">Default (Geist Sans)</option>
                  {fontFamilyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Size preset
                <select
                  value={sizePreset}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "custom") return;
                    patch({
                      fontSize:
                        value === ""
                          ? undefined
                          : textSizePresets[
                              value as keyof typeof textSizePresets
                            ],
                    });
                  }}
                >
                  <option value="">Default</option>
                  {Object.entries(textSizePresets).map(([value, size]) => (
                    <option key={value} value={value}>
                      {value[0]?.toUpperCase()}
                      {value.slice(1)} ({size}px)
                    </option>
                  ))}
                  {sizePreset === "custom" && (
                    <option value="custom">Custom</option>
                  )}
                </select>
              </label>
            </>
          )}
          {number(
            "fontSize",
            typography ? "Custom font size (px)" : "Font size (px)",
            10,
            160,
          )}
          {number("lineHeight", "Line height", 1, 3, 0.1)}
          <label className="block text-sm">
            Font weight
            <select
              value={resolved.fontWeight ?? ""}
              onChange={(event) =>
                patch({
                  fontWeight: (event.target.value ||
                    undefined) as CmsStyle["fontWeight"],
                })
              }
            >
              <option value="">Default</option>
              {["400", "500", "600", "700", "800"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Alignment
            <select
              value={resolved.align ?? ""}
              onChange={(event) =>
                patch({
                  align: (event.target.value || undefined) as CmsStyle["align"],
                })
              }
            >
              <option value="">Default</option>
              {["left", "center", "right"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          {number("borderWidth", "Border width (px)", 0, 12)}
          {color("borderColor", "Border color")}
          {number("radius", "Corner radius (px)", 0, 120)}
          <label className="block text-sm">
            Shadow
            <select
              value={resolved.shadow ?? ""}
              onChange={(event) =>
                patch({
                  shadow: (event.target.value ||
                    undefined) as CmsStyle["shadow"],
                })
              }
            >
              <option value="">Default</option>
              {["none", "small", "medium", "large"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Image fit
            <select
              value={resolved.objectFit ?? ""}
              onChange={(event) =>
                patch({
                  objectFit: (event.target.value ||
                    undefined) as CmsStyle["objectFit"],
                })
              }
            >
              <option value="">Default</option>
              <option>cover</option>
              <option>contain</option>
            </select>
          </label>
        </>
      )}
    </div>
  );
}

export function ThemePanel({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  const theme = content.settings.theme ?? themeSchema.parse({});
  const patch = (changes: Partial<typeof theme>) =>
    onChange({
      ...content,
      settings: { ...content.settings, theme: { ...theme, ...changes } },
    });
  return (
    <div className="space-y-5">
      <SiteSettings content={content} onChange={onChange} />
      <h3 className="font-semibold">Site theme · Geist Sans</h3>
      {(
        [
          "background",
          "foreground",
          "muted",
          "section",
          "card",
          "buttonBackground",
          "buttonForeground",
        ] as const
      ).map((key) => (
        <TextInput
          key={key}
          label={key + " color"}
          type="color"
          value={theme[key]}
          onChange={(value) => patch({ [key]: value })}
        />
      ))}
      {(["bodySize", "headingSize", "lineHeight"] as const).map((key) => (
        <TextInput
          key={key}
          label={key}
          type="number"
          value={String(theme[key])}
          onChange={(value) => patch({ [key]: Number(value) })}
        />
      ))}
      <label className="block text-sm">
        Body weight
        <select
          value={theme.bodyWeight}
          onChange={(event) =>
            patch({ bodyWeight: event.target.value as typeof theme.bodyWeight })
          }
        >
          {["400", "500", "600"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Heading weight
        <select
          value={theme.headingWeight}
          onChange={(event) =>
            patch({
              headingWeight: event.target.value as typeof theme.headingWeight,
            })
          }
        >
          {["500", "600", "700", "800"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function ChromeFields({
  kind,
  settings,
  onChange,
}: {
  kind: "header" | "footer";
  settings: Settings;
  onChange: (settings: Settings) => void;
}) {
  const current = settings[kind] ?? {
    visible: true,
    ctaLabel: "View projects",
    ctaHref: "/projects",
    copyright: "All rights reserved.",
  };
  const patch = (value: Partial<typeof current>) =>
    onChange({ ...settings, [kind]: { ...current, ...value } });
  const groups = current.groups ?? [
    {
      title: "Services",
      links: [
        { label: "Our Projects", href: "/projects" },
        { label: "Web & Mobile Apps", href: "/services" },
        { label: "Our Process", href: "/process" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];
  return (
    <div className="space-y-4">
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={current.visible}
          onChange={(event) => patch({ visible: event.target.checked })}
        />
        Show {kind}
      </label>
      <TextInput
        label="Site name"
        value={settings.siteName}
        onChange={(siteName) => onChange({ ...settings, siteName })}
      />
      <TextInput
        label="Logo URL"
        value={settings.logoUrl}
        onChange={(logoUrl) => onChange({ ...settings, logoUrl })}
      />
      <VisualAssetField
        label="Logo asset"
        value={{
          source: "upload",
          assetId: "logo",
          src: settings.logoUrl,
          alt: settings.siteName,
        }}
        onChange={(asset) => {
          if (asset?.source === "upload")
            onChange({ ...settings, logoUrl: asset.src });
        }}
      />
      {kind === "header" ? (
        <>
          <TextInput
            label="CTA label"
            value={current.ctaLabel}
            onChange={(ctaLabel) => patch({ ctaLabel })}
          />
          <TextInput
            label="CTA link"
            value={current.ctaHref}
            onChange={(ctaHref) => patch({ ctaHref })}
          />
          <h3 className="font-semibold">Navigation</h3>
          {settings.navLinks.map((link, index) => (
            <div key={index} className="space-y-2 rounded border p-3">
              <TextInput
                label="Label"
                value={link.label}
                onChange={(label) =>
                  onChange({
                    ...settings,
                    navLinks: settings.navLinks.map((item, i) =>
                      i === index ? { ...item, label } : item,
                    ),
                  })
                }
              />
              <TextInput
                label="Link"
                value={link.href}
                onChange={(href) =>
                  onChange({
                    ...settings,
                    navLinks: settings.navLinks.map((item, i) =>
                      i === index ? { ...item, href } : item,
                    ),
                  })
                }
              />
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="checkbox"
                  checked={link.visible}
                  onChange={(event) =>
                    onChange({
                      ...settings,
                      navLinks: settings.navLinks.map((item, i) =>
                        i === index
                          ? { ...item, visible: event.target.checked }
                          : item,
                      ),
                    })
                  }
                />
                Visible
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    const links = [...settings.navLinks];
                    [links[index - 1], links[index]] = [
                      links[index],
                      links[index - 1],
                    ];
                    onChange({ ...settings, navLinks: links });
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...settings,
                      navLinks: settings.navLinks.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={settings.navLinks.length >= 20}
            onClick={() =>
              onChange({
                ...settings,
                navLinks: [
                  ...settings.navLinks,
                  { label: "New link", href: "/", visible: true },
                ],
              })
            }
          >
            + Add navigation link
          </button>
        </>
      ) : (
        <>
          <TextInput
            label="Copyright text"
            value={current.copyright}
            onChange={(copyright) => patch({ copyright })}
          />
          <h3 className="font-semibold">Footer link groups</h3>
          {groups.map((group, index) => (
            <div key={index} className="space-y-3 rounded border p-3">
              <TextInput
                label="Group title"
                value={group.title}
                onChange={(title) =>
                  patch({
                    groups: groups.map((item, i) =>
                      i === index ? { ...item, title } : item,
                    ),
                  })
                }
              />
              {group.links.map((link, linkIndex) => (
                <div key={linkIndex} className="space-y-2 border-t pt-2">
                  <TextInput
                    label="Label"
                    value={link.label}
                    onChange={(label) =>
                      patch({
                        groups: groups.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                links: item.links.map((value, j) =>
                                  j === linkIndex ? { ...value, label } : value,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                  <TextInput
                    label="Link"
                    value={link.href}
                    onChange={(href) =>
                      patch({
                        groups: groups.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                links: item.links.map((value, j) =>
                                  j === linkIndex ? { ...value, href } : value,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        groups: groups.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                links: item.links.filter(
                                  (_, j) => j !== linkIndex,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  >
                    Remove link
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch({
                    groups: groups.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            links: [
                              ...item.links,
                              { label: "New link", href: "/" },
                            ],
                          }
                        : item,
                    ),
                  })
                }
              >
                + Add link
              </button>
              <button
                type="button"
                className="ml-3 text-destructive"
                onClick={() =>
                  patch({ groups: groups.filter((_, i) => i !== index) })
                }
              >
                Remove group
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={groups.length >= 6}
            onClick={() =>
              patch({ groups: [...groups, { title: "Links", links: [] }] })
            }
          >
            + Add group
          </button>
        </>
      )}
    </div>
  );
}

const mediaSchema = z.object({
  assets: z.array(
    z.object({ assetId: z.string(), src: z.string(), name: z.string() }),
  ),
});
export function MediaPanel({
  onUse,
}: {
  onUse: (src: string, alt: string) => void;
}) {
  const [assets, setAssets] = useState<z.infer<typeof mediaSchema>["assets"]>(
      [],
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load(): Promise<void> {
    try {
      const response = await fetch("/api/admin/media");
      if (!response.ok) throw new Error("Media library unavailable");
      setAssets(mediaSchema.parse(await response.json()).assets);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Media unavailable");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function upload(file: File): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      if (!response.ok)
        throw new Error(
          "Upload failed. Use PNG, JPEG, WebP, or a safe SVG up to 5 MB.",
        );
      await load();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select an image, or insert one into the selected column.
      </p>
      <label className="block text-sm">
        Upload image
        <input
          type="file"
          disabled={busy}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {assets.map((asset) => (
          <button
            type="button"
            key={asset.assetId}
            onClick={() => onUse(asset.src, asset.name)}
            className="overflow-hidden rounded border p-2 text-left text-xs"
          >
            <img
              src={asset.src}
              alt={asset.name}
              className="mb-2 aspect-square w-full object-contain"
            />
            {asset.name}
          </button>
        ))}
      </div>
      {!assets.length && !error && (
        <p className="text-sm">No images uploaded yet.</p>
      )}
    </div>
  );
}
const historySchema = z.object({
  revisions: z.array(
    z.object({
      _id: z.string(),
      revision: z.number(),
      createdAt: z.string(),
      author: z.string(),
      action: z.string(),
    }),
  ),
});
export function HistoryPanel({
  revision,
  disabled,
  onRestore,
}: {
  revision: number;
  disabled: boolean;
  onRestore: (id: string) => Promise<void>;
}) {
  const [items, setItems] = useState<
      z.infer<typeof historySchema>["revisions"]
    >([]),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void fetch("/api/admin/history")
      .then(async (response) => {
        if (!response.ok)
          throw new Error("History unavailable. Retry by reopening History.");
        const payload = historySchema.parse(await response.json());
        if (active) setItems(payload.revisions);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "History unavailable",
          );
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Latest 50 checkpoints. Restoring updates your draft; publish separately.
      </p>
      {error && <p role="alert">{error}</p>}
      {items.map((item) => (
        <div key={item._id} className="space-y-2 rounded border p-3 text-sm">
          <strong className="capitalize">
            {item.action} · revision {item.revision}
          </strong>
          <p>{new Date(item.createdAt).toLocaleString()}</p>
          <p className="break-all text-xs text-muted-foreground">
            {item.author}
          </p>
          {selected === item._id ? (
            <div className="space-y-2">
              <p>Restore this version into the draft?</p>
              <button
                type="button"
                disabled={disabled}
                className="min-h-10 rounded bg-primary px-3 text-primary-foreground"
                onClick={() => {
                  void onRestore(item._id);
                  setSelected(null);
                }}
              >
                Restore draft
              </button>
              <button
                type="button"
                className="ml-2 min-h-10"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              className="min-h-10 underline"
              onClick={() => setSelected(item._id)}
            >
              Restore this version
            </button>
          )}
        </div>
      ))}
      {!items.length && !error && (
        <p className="text-sm">History appears after the first save.</p>
      )}
    </div>
  );
}
