"use client";
import { useState } from "react";
import type { CmsBlock, CmsComponentKind, CmsVisualAsset, SiteContent, CmsBuilderElement } from "../lib/content";

function createClientId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
const publicComponentKinds: CmsComponentKind[] = [
  "homeHero", "featuredProjects", "teamStrip", "homeCta", "services",
  "process", "projectsCarousel", "contact", "aboutStory", "values", "legal",
];
const uiComponentKinds: CmsComponentKind[] = [
  "featureSplit", "stats", "testimonial", "faq", "logoStrip", "badge",
  "alert", "image", "divider", "spacer", "text", "buttonGroup", "formPresentation",
];

function blockLabel(block: CmsBlock): string { return block.type.replace(/([A-Z])/g, " $1"); }
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

export function BlockSettings({
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

export function VisualAssetField({
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

export function SiteSettings({
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

export function ElementFields({element,onChange}:{element:CmsBuilderElement;onChange:(element:CmsBuilderElement)=>void}){
if(element.type==="block") return <BlockSettings block={element.block} onChange={block=>onChange({...element,block})}/>;
return <div className="space-y-4">{element.type==="text"||element.type==="heading"?<TextField label="Text" value={element.text} onChange={text=>onChange({...element,text})}/>:element.type==="image"?<><Field label="Image URL" value={element.src} onChange={src=>onChange({...element,src})}/><Field label="Alt text" value={element.alt} onChange={alt=>onChange({...element,alt})}/><VisualAssetField label="Image asset" value={{source:"upload",assetId:"selected",src:element.src,alt:element.alt}} onChange={asset=>{if(asset?.source==="upload")onChange({...element,src:asset.src,alt:asset.alt})}}/></>:<><Field label="Label" value={element.label} onChange={label=>onChange({...element,label})}/><Field label="Link" value={element.href} onChange={href=>onChange({...element,href})}/></>}{element.type==="heading"&&<label>Heading level<select value={element.level} onChange={e=>onChange({...element,level:e.target.value as typeof element.level})}>{["h2","h3","h4"].map(level=><option key={level}>{level}</option>)}</select></label>}</div>}
