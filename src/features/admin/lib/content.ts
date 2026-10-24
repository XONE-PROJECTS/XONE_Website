import { z } from "zod";
import {
  imageUrlSchema,
  linkSchema,
  responsiveStyleSchema,
  seoSchema,
  themeSchema,
} from "./design";

import { projects, featuredProjects } from "@/features/projects/data/projects";
import { serviceOfferings } from "@/features/services/data/services";
import { processSteps } from "@/features/process/data/process-steps";
import {
  privacyContent,
  termsContent,
} from "@/features/legal/data/legal-content";
import {
  buildContactMailto,
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  BRAND_NAME,
} from "@/lib/brand";
import { DEFAULT_PREFLIGHT_CONTENT } from "@/features/preflight/data/preflight-content";

export const pageKeys = [
  "prehome",
  "home",
  "projects",
  "services",
  "about",
  "contact",
  "process",
  "privacy",
  "terms",
  "footer",
] as const;

const hrefSchema = linkSchema;

const itemSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000),
});

const visualAssetSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("library"),
    name: z.string().trim().min(1).max(80),
    color: z
      .string()
      .trim()
      .regex(/^(#[0-9a-fA-F]{6}|white|black|currentColor)$/)
      .optional(),
    size: z.number().int().min(8).max(256).optional(),
    variant: z.enum(["solid", "outline"]).default("solid"),
    label: z.string().trim().max(160).optional(),
  }),
  z.object({
    source: z.literal("upload"),
    assetId: z.string().trim().min(1).max(120),
    src: imageUrlSchema,
    alt: z.string().trim().max(240),
    width: z.number().int().min(1).max(2048).optional(),
    height: z.number().int().min(1).max(2048).optional(),
    color: z
      .string()
      .trim()
      .regex(/^(#[0-9a-fA-F]{6}|white|black|currentColor)$/)
      .optional(),
    size: z.number().int().min(8).max(512).optional(),
  }),
]);

const projectSchema = itemSchema.extend({
  id: z.string().trim().min(1).max(100),
  href: hrefSchema.optional(),
  imageSrc: imageUrlSchema.optional(),
  summary: z.string().trim().max(3000).optional(),
  mobileSummary: z.string().trim().max(3000).optional(),
  challenge: z.string().trim().max(3000).default(""),
  outcomes: z.array(z.string().trim().max(500)).max(20).default([]),
  category: z
    .enum(["web-app", "mobile-app", "automation", "marketing-site"])
    .default("web-app"),
  leadEngineer: z.string().trim().max(160).default(""),
  teamCredits: z
    .array(
      z.object({
        name: z.string().trim().max(160),
        role: z.string().trim().max(160),
      }),
    )
    .max(12)
    .default([]),
  liveHref: hrefSchema.optional(),
  liveLinkLabel: z.string().trim().max(120).default("View live site"),
  previewImageSrc: imageUrlSchema.optional(),
  image: visualAssetSchema.optional(),
  tags: z.array(z.string().trim().max(80)).max(30).default([]),
});

const legalSectionSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(240),
  paragraphs: z.array(z.string().trim().max(4000)).max(12),
  listItems: z.array(z.string().trim().max(500)).max(30).default([]),
});

const blockBase = { id: z.string().trim().min(1).max(100) };

const teamMemberSchema = z.object({
  name: z.string().trim().min(1).max(160),
  role: z.string().trim().min(1).max(160),
  initials: z.string().trim().min(1).max(8),
  photoSrc: imageUrlSchema,
  photo: visualAssetSchema.optional(),
  linkedin: hrefSchema.optional(),
  github: hrefSchema.optional(),
  portfolio: hrefSchema.optional(),
});
const componentKindSchema = z.enum([
  "homeHero",
  "featuredProjects",
  "teamStrip",
  "homeCta",
  "services",
  "process",
  "projectsCarousel",
  "contact",
  "aboutStory",
  "values",
  "legal",
  "featureSplit",
  "stats",
  "testimonial",
  "faq",
  "logoStrip",
  "badge",
  "alert",
  "image",
  "divider",
  "spacer",
  "text",
  "buttonGroup",
  "formPresentation",
]);
const componentItemSchema = z.object({
  title: z.string().trim().max(240).default(""),
  description: z.string().trim().max(2000).default(""),
  label: z.string().trim().max(120).default(""),
  value: z.string().trim().max(120).default(""),
  href: hrefSchema.optional(),
  image: visualAssetSchema.optional(),
  icon: visualAssetSchema.optional(),
});

export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    ...blockBase,
    type: z.literal("hero"),
    eyebrow: z.string().trim().max(160).optional(),
    heading: z.string().trim().min(1).max(240),
    body: z.string().trim().max(3000),
    ctaLabel: z.string().trim().max(120).optional(),
    ctaHref: hrefSchema.optional(),
    imageSrc: imageUrlSchema.optional(),
    imageAlt: z.string().trim().max(240).optional(),
    imageFit: z.enum(["cover", "contain"]).default("cover"),
    columns: z.number().int().min(1).max(3).default(1),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("text"),
    heading: z.string().trim().max(240).optional(),
    paragraphs: z.array(z.string().trim().max(3000)).min(1).max(12),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("cta"),
    heading: z.string().trim().min(1).max(240),
    body: z.string().trim().max(2000),
    label: z.string().trim().min(1).max(120),
    href: hrefSchema,
    secondaryLabel: z.string().trim().max(120).optional(),
    secondaryHref: hrefSchema.optional(),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("cards"),
    heading: z.string().trim().max(240).optional(),
    items: z
      .array(
        itemSchema.extend({
          imageSrc: imageUrlSchema.optional(),
          imageAlt: z.string().trim().max(240).optional(),
          image: visualAssetSchema.optional(),
          icon: visualAssetSchema.optional(),
        }),
      )
      .min(1)
      .max(24),
    columns: z.number().int().min(1).max(3).default(3),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("projectCollection"),
    heading: z.string().trim().max(240).optional(),
    body: z.string().trim().max(2000).default(""),
    display: z.enum(["grid", "carousel"]).default("grid"),
    items: z.array(projectSchema).max(100),
    columns: z.number().int().min(1).max(3).default(2),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("serviceCollection"),
    heading: z.string().trim().max(240).optional(),
    body: z.string().trim().max(2000).default(""),
    items: z
      .array(
        itemSchema.extend({
          icon: z
            .union([
              z.enum(["cog", "palette", "globe", "mobile"]),
              visualAssetSchema,
            ])
            .default("cog"),
          highlights: z.array(z.string().trim().max(160)).max(12),
        }),
      )
      .max(50),
    columns: z.number().int().min(1).max(3).default(2),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("contact"),
    heading: z.string().trim().min(1).max(240),
    body: z.string().trim().max(2000),
    detailsHeading: z.string().trim().max(240).default("Get in touch"),
    email: z.string().trim().email(),
    emailDescription: z
      .string()
      .trim()
      .max(500)
      .default("Primary way to reach us — click below to open your mail app."),
    phone: z.string().trim().max(80).default(""),
    phoneDisplay: z.string().trim().max(80).default(""),
    location: z.string().trim().max(240).default(""),
    secondaryLabel: z.string().trim().max(120).default("View our projects"),
    secondaryHref: hrefSchema.default("/projects"),
    note: z.string().trim().max(1000).default(""),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("preflight"),
    logoSrc: imageUrlSchema,
    logoAlt: z.string().trim().max(240),
    objectives: z.array(z.string().trim().min(1).max(300)).length(3),
    reasons: z.array(itemSchema).min(1).max(8),
    ctaLabel: z.string().trim().min(1).max(120),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("processCollection"),
    heading: z.string().trim().min(1).max(240),
    body: z.string().trim().max(2000),
    items: z
      .array(
        z.object({
          step: z.number().int().min(1).max(20),
          title: z.string().trim().min(1).max(160),
          description: z.string().trim().max(2000),
          details: z.array(z.string().trim().max(500)).max(20).default([]),
          icon: visualAssetSchema.optional(),
        }),
      )
      .min(1)
      .max(20),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("teamCollection"),
    heading: z.string().trim().min(1).max(240),
    body: z.string().trim().max(2000),
    items: z.array(teamMemberSchema).min(1).max(30),
    columns: z.number().int().min(1).max(3).default(3),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("legal"),
    title: z.string().trim().min(1).max(240),
    lastUpdated: z.string().trim().max(80),
    intro: z.string().trim().max(5000),
    sections: z.array(legalSectionSchema).max(40),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("footer"),
    description: z.string().trim().max(2000),
    links: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(120),
          href: hrefSchema,
        }),
      )
      .max(30),
    serviceLinks: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(120),
          href: hrefSchema,
        }),
      )
      .max(10)
      .default([]),
    companyLinks: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(120),
          href: hrefSchema,
        }),
      )
      .max(10)
      .default([]),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("component"),
    componentKind: componentKindSchema,
    heading: z.string().trim().max(240).default(""),
    body: z.string().trim().max(3000).default(""),
    label: z.string().trim().max(120).default(""),
    href: hrefSchema.optional(),
    asset: visualAssetSchema.optional(),
    icon: visualAssetSchema.optional(),
    items: z.array(componentItemSchema).max(50).default([]),
    columns: z.number().int().min(1).max(4).default(3),
    align: z.enum(["left", "center", "right"]).default("left"),
    spacing: z.enum(["compact", "default", "spacious"]).default("default"),
    visible: z.boolean().default(true),
  }),
]);

const builderElementBase = {
  id: z.string().trim().min(1).max(100),
  styles: responsiveStyleSchema.optional(),
};
const builderElementSchema = z.discriminatedUnion("type", [
  z.object({
    ...builderElementBase,
    type: z.literal("text"),
    text: z.string().trim().max(3000),
  }),
  z.object({
    ...builderElementBase,
    type: z.literal("heading"),
    text: z.string().trim().min(1).max(240),
    level: z.enum(["h2", "h3", "h4"]).default("h2"),
  }),
  z.object({
    ...builderElementBase,
    type: z.literal("image"),
    src: imageUrlSchema,
    alt: z.string().trim().max(240),
  }),
  z.object({
    ...builderElementBase,
    type: z.literal("button"),
    label: z.string().trim().min(1).max(120),
    href: hrefSchema,
  }),
  z.object({
    ...builderElementBase,
    type: z.literal("link"),
    label: z.string().trim().min(1).max(120),
    href: hrefSchema,
  }),
  z.object({
    ...builderElementBase,
    type: z.literal("block"),
    block: blockSchema,
  }),
]);
const builderColumnSchema = z.object({
  styles: responsiveStyleSchema.optional(),
  id: z.string().trim().min(1).max(100),
  elements: z.array(builderElementSchema).max(40),
});
const builderRowSchema = z.object({
  styles: responsiveStyleSchema.optional(),
  id: z.string().trim().min(1).max(100),
  columns: z.array(builderColumnSchema).min(1).max(4),
});
const builderSectionSchema = z.object({
  styles: responsiveStyleSchema.optional(),
  id: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(160),
  rows: z.array(builderRowSchema).min(1).max(20),
  visible: z.boolean().default(true),
});

export const pageContentSchema = z.object({
  blocks: z.array(blockSchema).max(40),
  sections: z.array(builderSectionSchema).max(40).optional(),
  seo: seoSchema.optional(),
});
const chromeSchema = z.object({
  visible: z.boolean().default(true),
  styles: responsiveStyleSchema.optional(),
  ctaLabel: z.string().trim().max(120).default("View projects"),
  ctaHref: hrefSchema.default("/projects"),
  copyright: z.string().trim().max(240).default("All rights reserved."),
  groups: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        links: z
          .array(
            z.object({
              label: z.string().trim().min(1).max(120),
              href: hrefSchema,
            }),
          )
          .max(30),
      }),
    )
    .max(6)
    .optional(),
});
const settingsSchema = z.object({
  theme: themeSchema.optional(),
  header: chromeSchema.optional(),
  footer: chromeSchema.optional(),
  siteName: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .default("Xone Software Development"),
  contactEmail: z
    .string()
    .trim()
    .email()
    .default("xonesoftware.marketing@gmail.com"),
  logoUrl: imageUrlSchema.default(
    "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
  ),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#533bda"),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#22d3ee"),
  defaultTitle: z.string().trim().max(160).default("Xone Software Development"),
  defaultDescription: z
    .string()
    .trim()
    .max(320)
    .default(
      "Custom software development for teams that need clarity, speed, and reliable delivery.",
    ),
  navLinks: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        href: hrefSchema,
        visible: z.boolean().default(true),
      }),
    )
    .max(20)
    .default([]),
});
export const siteContentSchema = z
  .object({
    pages: z.object({
      prehome: pageContentSchema.optional(),
      home: pageContentSchema,
      projects: pageContentSchema,
      services: pageContentSchema,
      about: pageContentSchema,
      contact: pageContentSchema,
      process: pageContentSchema,
      privacy: pageContentSchema,
      terms: pageContentSchema,
      footer: pageContentSchema,
    }),
    settings: settingsSchema.default({
      siteName: "Xone Software Development",
      contactEmail: "xonesoftware.marketing@gmail.com",
      logoUrl: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
      primaryColor: "#533bda",
      accentColor: "#22d3ee",
      defaultTitle: "Xone Software Development",
      defaultDescription:
        "Custom software development for teams that need clarity, speed, and reliable delivery.",
      navLinks: [
        { label: "Projects", href: "/projects", visible: true },
        { label: "Services", href: "/services", visible: true },
        { label: "About", href: "/about", visible: true },
        { label: "Contact", href: "/contact", visible: true },
      ],
    }),
  })
  .superRefine((content, context) => {
    for (const page of Object.values(content.pages)) {
      const nodeIds = new Set<string>();
      const check = (id: string) => {
        if (nodeIds.has(id))
          context.addIssue({
            code: "custom",
            message: "Page element IDs must be unique",
          });
        nodeIds.add(id);
      };
      for (const section of page.sections ?? []) {
        check(section.id);
        for (const row of section.rows) {
          check(row.id);
          for (const column of row.columns) {
            check(column.id);
            for (const element of column.elements) check(element.id);
          }
        }
      }
    }
  });

export type CmsBlock = z.infer<typeof blockSchema>;
export type CmsBuilderElement = z.infer<typeof builderElementSchema>;
export type CmsBuilderColumn = z.infer<typeof builderColumnSchema>;
export type CmsBuilderRow = z.infer<typeof builderRowSchema>;
export type CmsBuilderSection = z.infer<typeof builderSectionSchema>;
export type CmsPageContent = Omit<
  z.infer<typeof pageContentSchema>,
  "sections"
> & { sections: CmsBuilderSection[] };
export type SiteContent = Omit<z.infer<typeof siteContentSchema>, "pages"> & {
  pages: Record<PageKey, CmsPageContent>;
};
export type PageKey = (typeof pageKeys)[number];
export type SiteSettings = z.infer<typeof settingsSchema>;
export type CmsVisualAsset = z.infer<typeof visualAssetSchema>;
export type CmsComponentKind = z.infer<typeof componentKindSchema>;

function sectionsFromBlocks(blocks: readonly CmsBlock[]): CmsBuilderSection[] {
  return blocks.map((block) => ({
    id: `section-${block.id}`,
    label: block.type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (value) => value.toUpperCase()),
    visible: block.visible !== false,
    rows: [
      {
        id: `row-${block.id}`,
        columns: [
          {
            id: `column-${block.id}`,
            elements: [{ id: `element-${block.id}`, type: "block", block }],
          },
        ],
      },
    ],
  }));
}

function normalizePage(
  page: z.infer<typeof pageContentSchema>,
): CmsPageContent {
  const sections = page.sections ?? sectionsFromBlocks(page.blocks);
  const blocks = sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      row.columns.flatMap((column) =>
        column.elements.flatMap((element) =>
          element.type === "block" ? [element.block] : [],
        ),
      ),
    ),
  );
  return { ...page, sections, blocks };
}

function createDefaultPrehome(): z.infer<typeof pageContentSchema> {
  return {
    blocks: [
      {
        id: "prehome-preflight",
        type: "preflight" as const,
        logoSrc: DEFAULT_PREFLIGHT_CONTENT.logoSrc,
        logoAlt: DEFAULT_PREFLIGHT_CONTENT.logoAlt,
        objectives: [...DEFAULT_PREFLIGHT_CONTENT.objectives],
        reasons: DEFAULT_PREFLIGHT_CONTENT.reasons.map((reason) => ({
          ...reason,
        })),
        ctaLabel: DEFAULT_PREFLIGHT_CONTENT.ctaLabel,
        visible: true,
      },
    ],
  };
}

function removePreflight(page: CmsPageContent): CmsPageContent {
  const sections = page.sections.flatMap((section) => {
    const rows = section.rows.flatMap((row) => {
      const columns = row.columns.flatMap((column) => {
        const elements = column.elements.filter(
          (element) =>
            element.type !== "block" || element.block.type !== "preflight",
        );
        return elements.length ? [{ ...column, elements }] : [];
      });
      return columns.length ? [{ ...row, columns }] : [];
    });
    return rows.length ? [{ ...section, rows }] : [];
  });
  const blocks = sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      row.columns.flatMap((column) =>
        column.elements.flatMap((element) =>
          element.type === "block" ? [element.block] : [],
        ),
      ),
    ),
  );
  return { ...page, sections, blocks };
}

function normalizeContent(
  content: z.infer<typeof siteContentSchema>,
): SiteContent {
  return {
    ...content,
    pages: (() => {
      const pages = Object.fromEntries(
        Object.entries(content.pages)
          .filter(
            (entry): entry is [string, z.infer<typeof pageContentSchema>] =>
              Boolean(entry[1]),
          )
          .map(([key, page]) => [key, normalizePage(page)]),
      ) as Partial<SiteContent["pages"]>;
      const legacyPreflight = pages.home?.blocks.find(
        (block) => block.type === "preflight",
      );
      const prehome = pages.prehome?.blocks.some(
        (block) => block.type === "preflight",
      )
        ? pages.prehome
        : normalizePage(
            legacyPreflight
              ? { blocks: [legacyPreflight] }
              : createDefaultPrehome(),
          );
      return {
        ...pages,
        home: pages.home
          ? removePreflight(pages.home)
          : normalizePage({ blocks: [] }),
        prehome,
      } as SiteContent["pages"];
    })(),
  };
}

function cmsProject(project: (typeof projects)[number]) {
  return {
    id: project.id,
    title: project.title,
    description: project.summary,
    summary: project.summary,
    mobileSummary: project.mobileSummary,
    challenge: project.challenge,
    outcomes: project.outcomes,
    category: project.category,
    leadEngineer: project.leadEngineer ?? "",
    teamCredits: project.teamCredits ?? [],
    href: project.href,
    liveHref: project.liveHref,
    liveLinkLabel: project.liveLinkLabel ?? "View live site",
    previewImageSrc: project.previewImageSrc,
    tags: project.tags,
  };
}

const serviceIconNames = ["cog", "palette", "globe", "mobile"] as const;
const cmsServices = serviceOfferings.map((service, index) => ({
  icon: serviceIconNames[index] ?? "cog",
  title: service.title,
  description: service.description,
  highlights: service.highlights,
}));

export const defaultContent = {
  pages: {
    prehome: createDefaultPrehome(),
    home: {
      blocks: [
        {
          id: "home-hero",
          type: "hero",
          eyebrow: BRAND_NAME,
          heading:
            "Custom software for teams that need clarity and reliable delivery",
          body: "We design and build web apps, mobile experiences, and automation — with a direct line to the engineers who ship your product.",
          ctaLabel: "View our projects",
          ctaHref: "/projects",
        },
        {
          id: "home-projects",
          type: "projectCollection",
          display: "grid",
          columns: 3,
          heading: "Projects that show how we deliver",
          body: "Real problems, structured builds, measurable outcomes — explore case studies similar to what you need.",
          items: featuredProjects.map(cmsProject),
        },
        {
          id: "home-cta",
          type: "cta",
          heading: "Ready to talk about your project?",
          body: "Tell us what you are building. We respond within one business day to schedule a discovery conversation.",
          label: "Email us",
          href: buildContactMailto("Project inquiry"),
        },
      ],
    },
    projects: {
      blocks: [
        {
          id: "projects-hero",
          type: "hero",
          eyebrow: "Portfolio",
          heading: "Our projects",
          body: `Case studies from ${BRAND_NAME}. Swipe or use the dots to browse — the center card is in focus. Email us if something matches your needs.`,
          ctaLabel: `Email ${CONTACT_EMAIL}`,
          ctaHref: buildContactMailto("Project inquiry from portfolio"),
        },
        {
          id: "projects-list",
          type: "projectCollection",
          display: "carousel",
          columns: 1,
          heading: "Selected work",
          items: projects.map(cmsProject),
        },
        {
          id: "projects-cta",
          type: "cta",
          heading: "Have a project in mind?",
          body: "Tell us about your goals by email. We will follow up to schedule a discovery call.",
          label: "Send us an email",
          href: buildContactMailto(),
          secondaryLabel: "Contact details",
          secondaryHref: "/contact",
        },
      ],
    },
    services: {
      blocks: [
        {
          id: "services",
          type: "serviceCollection",
          heading: "Our Services",
          body: `${BRAND_NAME} delivers end-to-end digital solutions — from automation and design to production-ready web and mobile apps.`,
          columns: 2,
          items: cmsServices,
        },
      ],
    },
    about: {
      blocks: [
        {
          id: "about-intro",
          type: "hero",
          imageSrc: "/assets/XONE/xone_brand_kit/xone_logo.svg",
          imageAlt: BRAND_NAME,
          imageFit: "contain",
          heading: "About Xone",
          body: `${BRAND_NAME} is a forward-thinking software studio focused on system generation, UI/UX design, and web and mobile application development.`,
        },
        {
          id: "about-story",
          type: "text",
          heading: "Our story",
          paragraphs: [
            `We started Xone with a simple belief: technology should be powerful, accessible, and designed with real users in mind. Too many businesses struggle with fragmented tools, outdated interfaces, and systems that do not scale.`,
            "Our team bridges that gap — combining product thinking, design craft, and engineering discipline to deliver digital solutions that make work easier and growth sustainable.",
          ],
        },
        {
          id: "about-values",
          type: "cards",
          columns: 3,
          heading: "What we stand for",
          items: [
            {
              title: "User-first design",
              description:
                "Every product decision starts with the people who will use it — clarity, accessibility, and delight.",
            },
            {
              title: "Scalable engineering",
              description:
                "We build with TypeScript, modern frameworks, and patterns that grow with your business.",
            },
            {
              title: "Transparent partnership",
              description:
                "Regular demos, honest timelines, and collaborative communication from kickoff to launch.",
            },
          ],
        },
        {
          id: "about-cta",
          type: "cta",
          heading: "Ready to work together?",
          body: "Learn how we plan, build, and deliver — or reach out to discuss your next project.",
          label: "See our process",
          href: "/process",
          secondaryLabel: "Contact us",
          secondaryHref: "/contact",
        },
      ],
    },
    contact: {
      blocks: [
        {
          id: "contact",
          type: "contact",
          heading: `Contact ${BRAND_NAME}`,
          body: "Email us about your project. We respond within one business day to schedule a discovery call.",
          detailsHeading: "Get in touch",
          email: CONTACT_EMAIL,
          emailDescription:
            "Primary way to reach us — click below to open your mail app.",
          phone: CONTACT_PHONE,
          phoneDisplay: CONTACT_PHONE_DISPLAY,
          location: CONTACT_LOCATION,
          secondaryLabel: "View our projects",
          secondaryHref: "/projects",
          note: "Online contact forms are planned for a future release. For now, email is the fastest path to a qualified conversation.",
        },
      ],
    },
    process: {
      blocks: [
        {
          id: "process",
          type: "processCollection",
          heading: "How We Work",
          body: `${BRAND_NAME} follows a proven five-step process to deliver successful projects — from discovery through long-term support.`,
          items: processSteps.map((step) => ({
            step: step.step,
            title: step.title,
            description: step.summary,
            details: step.details,
          })),
        },
      ],
    },
    privacy: { blocks: [{ id: "privacy", type: "legal", ...privacyContent }] },
    terms: { blocks: [{ id: "terms", type: "legal", ...termsContent }] },
    footer: {
      blocks: [
        {
          id: "footer",
          type: "footer",
          description:
            "Custom software development for teams that need clarity, speed, and reliable delivery.",
          links: [],
          serviceLinks: [
            { label: "Our Projects", href: "/projects" },
            { label: "Web & Mobile Apps", href: "/services" },
            { label: "Our Process", href: "/process" },
          ],
          companyLinks: [
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
          visible: true,
        },
      ],
    },
  },
  settings: {
    siteName: BRAND_NAME,
    contactEmail: CONTACT_EMAIL,
    logoUrl: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
    primaryColor: "#533bda",
    accentColor: "#22d3ee",
    defaultTitle: BRAND_NAME,
    defaultDescription:
      "Custom software development for teams that need clarity, speed, and reliable delivery.",
    navLinks: [
      { label: "Projects", href: "/projects", visible: true },
      { label: "Services", href: "/services", visible: true },
      { label: "About", href: "/about", visible: true },
      { label: "Contact", href: "/contact", visible: true },
    ],
  },
} as unknown as SiteContent;

export function parseSiteContent(value: unknown): SiteContent {
  const current = siteContentSchema.safeParse(value);
  if (current.success) return normalizeContent(current.data);

  if (
    !value ||
    typeof value !== "object" ||
    !("pages" in value) ||
    !value.pages ||
    typeof value.pages !== "object" ||
    "process" in value.pages ||
    "settings" in value
  )
    throw current.error;
  const legacy = z
    .object({
      pages: z.object({
        home: pageContentSchema,
        projects: pageContentSchema,
        services: pageContentSchema,
        about: pageContentSchema,
        contact: pageContentSchema,
        footer: pageContentSchema,
      }),
    })
    .safeParse(value);
  if (!legacy.success) throw current.error;
  return normalizeContent(
    siteContentSchema.parse({
      ...defaultContent,
      pages: { ...defaultContent.pages, ...legacy.data.pages },
    }),
  );
}
