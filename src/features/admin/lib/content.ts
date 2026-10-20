import { z } from "zod";
import { imageUrlSchema, linkSchema, responsiveStyleSchema, seoSchema, themeSchema } from "./design";

import { teamMembers } from "@/lib/team-members";

export const pageKeys = [
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
    color: z.string().trim().regex(/^(#[0-9a-fA-F]{6}|white|black|currentColor)$/).optional(),
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
    color: z.string().trim().regex(/^(#[0-9a-fA-F]{6}|white|black|currentColor)$/).optional(),
    size: z.number().int().min(8).max(512).optional(),
  }),
]);

const projectSchema = itemSchema.extend({
  id: z.string().trim().min(1).max(100),
  href: hrefSchema.optional(),
  imageSrc: imageUrlSchema.optional(),
  summary: z.string().trim().max(3000).optional(),
  challenge: z.string().trim().max(3000).default(""),
  outcomes: z.array(z.string().trim().max(500)).max(20).default([]),
  category: z.enum(["web-app", "mobile-app", "automation", "marketing-site"]).default("web-app"),
  leadEngineer: z.string().trim().max(160).default(""),
  teamCredits: z.array(z.object({ name: z.string().trim().max(160), role: z.string().trim().max(160) })).max(12).default([]),
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
  "homeHero", "featuredProjects", "teamStrip", "homeCta", "services",
  "process", "projectsCarousel", "contact", "aboutStory", "values", "legal",
  "featureSplit", "stats", "testimonial", "faq", "logoStrip", "badge",
  "alert", "image", "divider", "spacer", "text", "buttonGroup", "formPresentation",
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
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("cards"),
    heading: z.string().trim().max(240).optional(),
    items: z.array(itemSchema.extend({
      imageSrc: imageUrlSchema.optional(),
      imageAlt: z.string().trim().max(240).optional(),
      image: visualAssetSchema.optional(),
      icon: visualAssetSchema.optional(),
    })).min(1).max(24),
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
    items: z.array(itemSchema.extend({ icon: z.union([z.enum(["cog", "palette", "globe", "mobile"]), visualAssetSchema]).default("cog"), highlights: z.array(z.string().trim().max(160)).max(12) })).max(50),
    columns: z.number().int().min(1).max(3).default(2),
    visible: z.boolean().default(true),
  }),
  z.object({
    ...blockBase,
    type: z.literal("contact"),
    heading: z.string().trim().min(1).max(240),
    body: z.string().trim().max(2000),
    email: z.string().trim().email(),
    phone: z.string().trim().max(80).default(""),
    location: z.string().trim().max(240).default(""),
    secondaryLabel: z.string().trim().max(120).default("View our projects"),
    secondaryHref: hrefSchema.default("/projects"),
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
    items: z.array(z.object({
      step: z.number().int().min(1).max(20),
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().max(2000),
      icon: visualAssetSchema.optional(),
    })).min(1).max(20),
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
    links: z.array(z.object({ label: z.string().trim().min(1).max(120), href: hrefSchema })).max(30),
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

const builderElementBase = { id: z.string().trim().min(1).max(100), styles: responsiveStyleSchema.optional() };
const builderElementSchema = z.discriminatedUnion("type", [
  z.object({ ...builderElementBase, type: z.literal("text"), text: z.string().trim().max(3000) }),
  z.object({ ...builderElementBase, type: z.literal("heading"), text: z.string().trim().min(1).max(240), level: z.enum(["h2", "h3", "h4"]).default("h2") }),
  z.object({ ...builderElementBase, type: z.literal("image"), src: imageUrlSchema, alt: z.string().trim().max(240) }),
  z.object({ ...builderElementBase, type: z.literal("button"), label: z.string().trim().min(1).max(120), href: hrefSchema }),
  z.object({ ...builderElementBase, type: z.literal("link"), label: z.string().trim().min(1).max(120), href: hrefSchema }),
  z.object({ ...builderElementBase, type: z.literal("block"), block: blockSchema }),
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
const customPageDefinitionSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(240).default(""),
  archived: z.boolean().default(false),
});
const chromeSchema = z.object({
  visible: z.boolean().default(true), styles: responsiveStyleSchema.optional(),
  ctaLabel: z.string().trim().max(120).default("View projects"), ctaHref: hrefSchema.default("/projects"),
  copyright: z.string().trim().max(240).default("All rights reserved."),
  groups: z.array(z.object({ title: z.string().trim().min(1).max(120), links: z.array(z.object({ label: z.string().trim().min(1).max(120), href: hrefSchema })).max(30) })).max(6).optional(),
});
const settingsSchema = z.object({
  theme: themeSchema.optional(), header: chromeSchema.optional(), footer: chromeSchema.optional(),
  siteName: z.string().trim().min(1).max(120).default("Xone Software Development"),
  contactEmail: z.string().trim().email().default("xonesoftware.marketing@gmail.com"),
  logoUrl: imageUrlSchema.default("/assets/XONE/xone_brand_kit/xone_logo_inverse.svg"),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).default("#533bda"),
  accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).default("#22d3ee"),
  defaultTitle: z.string().trim().max(160).default("Xone Software Development"),
  defaultDescription: z.string().trim().max(320).default("Custom software development for teams that need clarity, speed, and reliable delivery."),
  navLinks: z.array(z.object({ label: z.string().trim().min(1).max(120), href: hrefSchema, visible: z.boolean().default(true) })).max(20).default([]),
});
export const siteContentSchema = z.object({
  pages: z.object({
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
  customPages: z.record(z.string(), pageContentSchema).default({}),
  customPageDefinitions: z.array(customPageDefinitionSchema).max(100).default([]),
  settings: settingsSchema.default({
    siteName: "Xone Software Development",
    contactEmail: "xonesoftware.marketing@gmail.com",
    logoUrl: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
    primaryColor: "#533bda",
    accentColor: "#22d3ee",
    defaultTitle: "Xone Software Development",
    defaultDescription: "Custom software development for teams that need clarity, speed, and reliable delivery.",
    navLinks: [{ label: "Projects", href: "/projects", visible: true }, { label: "Services", href: "/services", visible: true }, { label: "About", href: "/about", visible: true }, { label: "Contact", href: "/contact", visible: true }],
  }),
}).superRefine((content, context) => {
  const slugs = new Set<string>(), ids = new Set<string>();
  const reserved = new Set<string>([...pageKeys, "admin", "api", "home", "get-started", "robots", "sitemap", "favicon", "_next", "assets"]);
  for (const page of content.customPageDefinitions) {
    if (reserved.has(page.slug) || slugs.has(page.slug) || ids.has(page.id) || !content.customPages[page.id]) context.addIssue({ code: "custom", message: "Custom pages need unique, non-reserved URLs and matching content", path: ["customPageDefinitions"] });
    slugs.add(page.slug); ids.add(page.id);
  }
  for (const page of [...Object.values(content.pages), ...Object.values(content.customPages)]) {
    const nodeIds = new Set<string>();
    const check = (id: string) => { if (nodeIds.has(id)) context.addIssue({ code: "custom", message: "Page element IDs must be unique" }); nodeIds.add(id); };
    for (const section of page.sections ?? []) { check(section.id); for (const row of section.rows) { check(row.id); for (const column of row.columns) { check(column.id); for (const element of column.elements) check(element.id); } } }
  }
});

export type CmsBlock = z.infer<typeof blockSchema>;
export type CmsBuilderElement = z.infer<typeof builderElementSchema>;
export type CmsBuilderColumn = z.infer<typeof builderColumnSchema>;
export type CmsBuilderRow = z.infer<typeof builderRowSchema>;
export type CmsBuilderSection = z.infer<typeof builderSectionSchema>;
export type CmsPageContent = Omit<z.infer<typeof pageContentSchema>, "sections"> & { sections: CmsBuilderSection[] };
export type SiteContent = Omit<z.infer<typeof siteContentSchema>, "pages" | "customPages"> & { pages: Record<PageKey, CmsPageContent>; customPages: Record<string, CmsPageContent> };
export type PageKey = (typeof pageKeys)[number];
export type CustomPageDefinition = z.infer<typeof customPageDefinitionSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export type CmsVisualAsset = z.infer<typeof visualAssetSchema>;
export type CmsComponentKind = z.infer<typeof componentKindSchema>;

function sectionsFromBlocks(blocks: readonly CmsBlock[]): CmsBuilderSection[] {
  return blocks.map((block) => ({
    id: `section-${block.id}`,
    label: block.type.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase()),
    visible: block.visible !== false,
    rows: [{
      id: `row-${block.id}`,
      columns: [{ id: `column-${block.id}`, elements: [{ id: `element-${block.id}`, type: "block", block }] }],
    }],
  }));
}

function normalizePage(page: z.infer<typeof pageContentSchema>): CmsPageContent {
  const sections = page.sections ?? sectionsFromBlocks(page.blocks);
  const blocks = sections.flatMap(section => section.rows.flatMap(row => row.columns.flatMap(column => column.elements.flatMap(element => element.type === "block" ? [element.block] : []))));
  return { ...page, sections, blocks };
}

function normalizeContent(content: z.infer<typeof siteContentSchema>): SiteContent {
  return {
    ...content,
    pages: Object.fromEntries(Object.entries(content.pages).map(([key, page]) => [key, normalizePage(page)])) as SiteContent["pages"],
    customPages: Object.fromEntries(Object.entries(content.customPages).map(([key, page]) => [key, normalizePage(page)])),
  };
}

export const defaultContent = {
  pages: {
    home: { blocks: [
      { id: "home-preflight", type: "preflight", logoSrc: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg", logoAlt: "Xone Software Development", objectives: ["Build custom software with clarity and reliable delivery", "Design user-first products that scale with your business", "Partner transparently from discovery through launch"], reasons: [
        { title: "Senior-led team", description: "work directly with the engineers who ship your product" },
        { title: "Proven delivery", description: "portfolio case studies with measurable outcomes" },
        { title: "Modern, maintainable stack", description: "TypeScript-first web and mobile builds" },
        { title: "Clear communication", description: "honest timelines and fast email follow-up" },
      ], ctaLabel: "Start Building with XONE" },
      { id: "home-hero", type: "hero", eyebrow: "Xone Software Development", heading: "Custom software for teams that need clarity and reliable delivery", body: "We design and build web apps, mobile experiences, and automation — with a direct line to the engineers who ship your product.", ctaLabel: "View our projects", ctaHref: "/projects" },
      { id: "home-projects", type: "projectCollection", display: "grid", heading: "Projects that show how we deliver", body: "Real problems, structured builds, measurable outcomes — explore case studies similar to what you need.", items: [
        { id: "smart-cubicle-main", title: "Smart restroom preventive maintenance", description: "IoT and machine-learning platform that monitors occupancy, air quality, and supplies — then surfaces predictive maintenance on a real-time admin dashboard.", href: "https://github.com/ryMGDLT/SMART_CUBICLE_MAIN" },
        { id: "esp32-controller-app", title: "ESP32 mobile controller app", description: "Flutter Android app paired with ESP32 firmware to control relays and LEDs over Bluetooth or Wi-Fi.", href: "https://github.com/ryMGDLT/ESP32_Controller_APP" },
        { id: "lightbox-studio-website", title: "LightBox Studio website", description: "Full-stack studio website for photography and videography, portfolio galleries, and booking flows.", liveHref: "https://www.thelightboxstudios.com/" },
      ] },
      { id: "home-team", type: "teamCollection", heading: "Engineers you will work with", body: "Xone is a small, senior-led team — no hand-offs to anonymous contractors.", items: teamMembers },
      { id: "home-cta", type: "cta", heading: "Ready to talk about your project?", body: "Tell us what you are building. We respond within one business day to schedule a discovery conversation.", label: "Email us", href: "mailto:xonesoftware.marketing@gmail.com?subject=Project%20inquiry" },
    ] },
    projects: { blocks: [
      { id: "projects-hero", type: "hero", heading: "Our projects", body: "A selection of products, platforms, and experiences we have helped bring to life.", ctaLabel: "Start a conversation", ctaHref: "/contact" },
      { id: "projects-list", type: "projectCollection", display: "carousel", heading: "Selected work", items: [
        { id: "smart-cubicle-main", title: "Smart restroom preventive maintenance", description: "IoT and machine-learning platform for predictive maintenance.", href: "https://github.com/ryMGDLT/SMART_CUBICLE_MAIN" },
        { id: "esp32-controller-app", title: "ESP32 mobile controller app", description: "Flutter Android app paired with ESP32 firmware for Bluetooth and Wi-Fi control.", href: "https://github.com/ryMGDLT/ESP32_Controller_APP" },
        { id: "lightbox-studio-website", title: "LightBox Studio website", description: "Full-stack studio website for photography, videography, gallery, and booking flows.", href: "https://www.thelightboxstudios.com/" },
        { id: "xone-software-solutions", title: "Xone Software Solutions", description: "Company marketing site on Next.js App Router with portfolio, services, team, and email-first lead capture.", href: "https://github.com/JshMarkCastillo-GHdev/xone-swe-next" },
        { id: "rahamen-digital-base44", title: "Rahamen restaurant website", description: "A clickable restaurant brand and menu mockup prepared for production.", href: "https://rahamen.base44.app/" },
      ] },
    ] },
    services: { blocks: [{ id: "services", type: "serviceCollection", heading: "Our Services", items: [
      { icon: "cog", title: "System Generation & Automation", description: "Streamline your workflows with intelligent automation solutions that boost efficiency and reduce manual tasks.", highlights: ["Process automation", "Workflow optimization", "System integration", "Custom tooling"] },
      { icon: "palette", title: "UI/UX Design", description: "Create user-centered, seamless experiences that engage your audience and drive conversions.", highlights: ["User research", "Interface design", "Prototyping", "Design systems"] },
      { icon: "globe", title: "Web Application Development", description: "Build scalable, secure, and modern web applications that grow with your business needs.", highlights: ["Full-stack development", "API integration", "Performance optimization", "Cloud deployment"] },
      { icon: "mobile", title: "Mobile Application Development", description: "Develop cross-platform, engaging mobile apps that provide exceptional user experiences.", highlights: ["iOS and Android", "Cross-platform builds", "App store optimization", "Offline-first experiences"] },
    ] }] },
    about: { blocks: [
      { id: "about-intro", type: "hero", imageSrc: "/assets/XONE/xone_brand_kit/xone_logo.svg", imageAlt: "Xone Software Development", imageFit: "contain", heading: "About Xone", body: "Xone Software Development is a forward-thinking software studio focused on system generation, UI/UX design, and web and mobile application development." },
      { id: "about-story", type: "text", heading: "Our story", paragraphs: ["We started Xone with a simple belief: technology should be powerful, accessible, and designed with real users in mind.", "Our team combines product thinking, design craft, and engineering discipline to deliver digital solutions that make work easier and growth sustainable."] },
      { id: "about-values", type: "cards", heading: "What we stand for", items: [
        { title: "User-first design", description: "Every product decision starts with the people who will use it — clarity, accessibility, and delight." },
        { title: "Scalable engineering", description: "We build with TypeScript, modern frameworks, and patterns that grow with your business." },
        { title: "Transparent partnership", description: "Regular demos, honest timelines, and collaborative communication from kickoff to launch." },
      ] },
      { id: "about-cta", type: "cta", heading: "Ready to work together?", body: "Learn how we plan, build, and deliver — or reach out to discuss your next project.", label: "See our process", href: "/process" },
    ] },
    contact: { blocks: [{ id: "contact", type: "contact", heading: "Contact Xone Software Development", body: "Email us about your project. We respond within one business day to schedule a discovery call.", email: "xonesoftware.marketing@gmail.com", phone: "+639533720594", location: "Remote-first team serving clients worldwide", secondaryLabel: "View our projects", secondaryHref: "/projects" }] },
    process: { blocks: [{ id: "process", type: "processCollection", heading: "How We Work", body: "Xone Software Development follows a proven five-step process to deliver successful projects — from discovery through long-term support.", items: [
      { step: 1, title: "Determine", description: "Understanding your needs, goals, and target audience through comprehensive research and analysis." },
      { step: 2, title: "Design", description: "Creating wireframes, prototypes, and visual designs that align with your brand and user expectations." },
      { step: 3, title: "Development", description: "Building robust, scalable applications using modern technologies and best development practices." },
      { step: 4, title: "Deployment", description: "Launching your application with proper testing, optimization, and seamless go-live processes." },
      { step: 5, title: "Support", description: "Providing ongoing maintenance, updates, and support to ensure continued success and growth." },
    ] }] },
    privacy: { blocks: [{ id: "privacy", type: "legal", title: "Privacy Policy", lastUpdated: "June 14, 2026", intro: "Xone Software Development respects your privacy. This policy describes what information we collect when you visit our website, how we use it, and the choices available to you.", sections: [{ id: "information-we-collect", title: "Information we collect", paragraphs: ["We collect limited information automatically when you browse our public pages, such as IP address, browser type, device type, referring URL, and pages viewed. If you email us, we receive the contents of your message and any contact details you choose to include."], listItems: ["Server and analytics logs", "Information you voluntarily send by email or phone", "Cookie or local storage data only where required for basic site functionality"] }, { id: "how-we-use-information", title: "How we use information", paragraphs: ["We use collected information to operate and improve the website, respond to inquiries, understand aggregate traffic patterns, and protect against abuse or security incidents. We do not sell personal information."], listItems: ["Respond to project inquiries and schedule discovery calls", "Maintain site security, uptime, and performance", "Comply with applicable legal obligations"] }, { id: "sharing", title: "When we share information", paragraphs: ["We share information only with service providers that help us host and operate the site, when required by law, or to protect our rights and users."] }, { id: "your-rights", title: "Your choices and rights", paragraphs: ["Depending on your location, you may have rights to access, correct, delete, or restrict certain processing of personal information. Contact xonesoftware.marketing@gmail.com with questions."] }, { id: "changes", title: "Changes to this policy", paragraphs: ["We may update this Privacy Policy to reflect product, legal, or operational changes. The last updated date will change when revisions are published."] }] }] },
    terms: { blocks: [{ id: "terms", type: "legal", title: "Terms of Service", lastUpdated: "June 14, 2026", intro: "These Terms of Service govern your access to and use of the Xone Software Development marketing website. Custom software engagements are governed by separate written agreements signed with clients.", sections: [{ id: "use-of-site", title: "Use of the website", paragraphs: ["You may use this site for lawful purposes only. You agree not to interfere with site operation, attempt unauthorized access, scrape content in violation of applicable law, or transmit malware or abusive content."] }, { id: "services", title: "Marketing content vs. professional services", paragraphs: ["Information on this site describes our capabilities, process, and sample work. Project scope, timelines, fees, and deliverables are defined only in a mutually executed statement of work or contract."] }, { id: "intellectual-property", title: "Intellectual property", paragraphs: ["Unless otherwise noted, Xone owns the text, design, logos, and other materials on this site. Client project deliverables and ownership terms are addressed in individual client agreements."] }, { id: "third-party-links", title: "Third-party links", paragraphs: ["Our site may link to external websites or portfolio demos. We are not responsible for the content, privacy practices, or availability of third-party sites."] }, { id: "contact", title: "Contact", paragraphs: ["Questions about these Terms may be sent to xonesoftware.marketing@gmail.com or via our Contact page."] }] }] },
    footer: { blocks: [{ id: "footer", type: "footer", description: "Custom software development for teams that need clarity, speed, and reliable delivery.", links: [{ label: "Projects", href: "/projects" }, { label: "Services", href: "/services" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] }] },
  },
  customPages: {},
  customPageDefinitions: [],
  settings: {
    siteName: "Xone Software Development",
    contactEmail: "xonesoftware.marketing@gmail.com",
    logoUrl: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
    primaryColor: "#533bda",
    accentColor: "#22d3ee",
    defaultTitle: "Xone Software Development",
    defaultDescription: "Custom software development for teams that need clarity, speed, and reliable delivery.",
    navLinks: [{ label: "Projects", href: "/projects", visible: true }, { label: "Services", href: "/services", visible: true }, { label: "About", href: "/about", visible: true }, { label: "Contact", href: "/contact", visible: true }],
  },
} as unknown as SiteContent;

export function parseSiteContent(value: unknown): SiteContent {
  const current = siteContentSchema.safeParse(value);
  if (current.success) return normalizeContent(current.data);

  if (!value || typeof value !== "object" || !("pages" in value) || !value.pages || typeof value.pages !== "object" || "process" in value.pages || "settings" in value) throw current.error;
  const legacy = z.object({ pages: z.object({ home: pageContentSchema, projects: pageContentSchema, services: pageContentSchema, about: pageContentSchema, contact: pageContentSchema, footer: pageContentSchema }) }).safeParse(value);
  if (!legacy.success) throw current.error;
  return normalizeContent(siteContentSchema.parse({ ...defaultContent, pages: { ...defaultContent.pages, ...legacy.data.pages } }));
}
