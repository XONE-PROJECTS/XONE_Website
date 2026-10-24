import { z } from "zod";

export const estimatorGroups = {
  web: "Website & eCommerce",
  inventory: "Inventory & Procurement",
  sales: "CRM & Sales",
  operations: "Business Operations & ERP",
  events: "Weddings & Events",
  apps: "Apps & Automation",
  design: "Design",
  custom: "Custom",
} as const;

export type EstimatorGroup = keyof typeof estimatorGroups;

function system<const Id extends string>(
  id: Id,
  group: EstimatorGroup,
  label: string,
  pesos: number | null,
  description: string,
  features: readonly string[],
) {
  return {
    id,
    group,
    label,
    priceCents: pesos === null ? null : pesos * 100,
    description,
    features,
  };
}

export const systemDefinitions = [
  system(
    "landing",
    "web",
    "Landing page",
    12000,
    "A focused page to introduce your business and convert visitors.",
    ["Responsive design", "Contact links", "Launch-ready page"],
  ),
  system(
    "promotional",
    "web",
    "Promotional website with full CMS",
    25000,
    "A multi-page business website with content you can manage.",
    ["Full CMS included", "Responsive pages", "Content publishing"],
  ),
  system(
    "ecommerce",
    "web",
    "E-commerce website",
    40000,
    "An online storefront for showcasing and selling products.",
    ["E-commerce included", "Product management", "Cart and order workflow"],
  ),
  system(
    "menu",
    "web",
    "Digital / QR menu system",
    20000,
    "A managed menu customers can open by scanning a QR code.",
    [
      "QR menu access included",
      "Categories, prices and photos",
      "Menu management",
    ],
  ),
  system(
    "inventory",
    "inventory",
    "Inventory management",
    40000,
    "Track stock quantities, movements, and reorder alerts.",
    ["Stock tracking", "Movement history", "Reorder alerts"],
  ),
  system(
    "procurement",
    "inventory",
    "Procurement / purchasing management",
    45000,
    "Manage purchase requests, purchase orders, and suppliers.",
    ["Purchase requests", "Purchase orders", "Supplier records"],
  ),
  system(
    "warehouse",
    "inventory",
    "Warehouse management",
    65000,
    "Coordinate receiving, storage locations, picking, and dispatch.",
    ["Receiving and locations", "Picking workflow", "Dispatch tracking"],
  ),
  system(
    "assets",
    "inventory",
    "Asset management",
    45000,
    "Track company equipment, assignments, and asset lifecycle.",
    ["Asset register", "Assignments", "Asset history"],
  ),
  system(
    "crm",
    "sales",
    "CRM / customer management",
    45000,
    "Organize contacts, leads, and customer pipelines.",
    ["Contacts and leads", "Sales pipeline", "Customer activity"],
  ),
  system(
    "sales",
    "sales",
    "Sales management",
    35000,
    "Manage quotations, sales orders, and sales performance.",
    ["Quotations", "Sales orders", "Sales tracking"],
  ),
  system(
    "pos",
    "sales",
    "POS system",
    45000,
    "A checkout workflow for your store and sales team.",
    ["Checkout", "Sales records", "Receipt workflow"],
  ),
  system(
    "internal",
    "operations",
    "Internal business system",
    60000,
    "Custom tools built around your team's day-to-day work.",
    ["Role-based workflows", "Records management", "Dashboard"],
  ),
  system(
    "operations",
    "operations",
    "Operations Management System",
    60000,
    "Coordinate tasks, operational processes, and performance.",
    ["Operational workflows", "Task coordination", "Performance tracking"],
  ),
  system(
    "erp",
    "operations",
    "ERP system",
    150000,
    "An integrated multi-department solution; modules are confirmed during scoping.",
    [
      "Integrated core",
      "Shared business records",
      "Cross-department reporting",
    ],
  ),
  system(
    "finance",
    "operations",
    "Finance management",
    75000,
    "Plan budgets, monitor cash flow, and understand business finances.",
    ["Budgets", "Cash flow", "Financial dashboards"],
  ),
  system(
    "accounting",
    "operations",
    "Accounting system",
    65000,
    "Manage bookkeeping, receivables, payables, and accounting reports.",
    ["Bookkeeping", "Receivables and payables", "Accounting reports"],
  ),
  system(
    "hris",
    "operations",
    "HRIS",
    70000,
    "Manage employee records, attendance, and leave requests.",
    ["Employee records", "Attendance", "Leave management"],
  ),
  system(
    "project",
    "operations",
    "Project management",
    45000,
    "Coordinate project tasks, milestones, and team progress.",
    ["Tasks and milestones", "Team assignments", "Progress reporting"],
  ),
  system(
    "hotel",
    "operations",
    "Hotel management",
    80000,
    "Manage rooms, reservations, check-in/out, and housekeeping.",
    ["Rooms and reservations", "Check-in and check-out", "Housekeeping"],
  ),
  system(
    "school",
    "operations",
    "School management",
    80000,
    "Organize student records, enrollment, and school administration.",
    ["Student records", "Enrollment", "Administrative reporting"],
  ),
  system(
    "restaurant",
    "operations",
    "Restaurant management",
    45000,
    "Coordinate your restaurant's menu, service, and daily operations.",
    ["Menu management", "Service workflow", "Operations dashboard"],
  ),
  system(
    "booking",
    "operations",
    "Booking / reservation system",
    30000,
    "Manage availability and customer reservations.",
    ["Booking functionality included", "Availability", "Reservation records"],
  ),
  system(
    "ticketing",
    "operations",
    "Ticketing / help desk",
    35000,
    "Track support requests, assignments, and resolution status.",
    ["Support tickets", "Assignments and statuses", "Resolution history"],
  ),
  system(
    "queuing",
    "operations",
    "Queuing system",
    30000,
    "Manage customer queues, service counters, and calling displays.",
    ["Queue numbers", "Service counters", "Calling display"],
  ),
  system(
    "wedding-web",
    "events",
    "Wedding invitation website / web app",
    18000,
    "A browser-based invitation guests can open on any device.",
    [
      "RSVP and guest tracking included",
      "Schedule and venue",
      "Invitation design",
    ],
  ),
  system(
    "wedding-mobile",
    "events",
    "Wedding invitation mobile app",
    45000,
    "An installed mobile invitation app for your wedding guests.",
    [
      "RSVP and guest tracking included",
      "Schedule and venue",
      "Mobile invitation design",
    ],
  ),
  system(
    "photobooth",
    "events",
    "Photobooth system",
    35000,
    "A photo capture, template, and print-layout workflow for events.",
    [
      "Capture workflow",
      "Photo templates",
      "Print layouts; hardware confirmed separately",
    ],
  ),
  system(
    "mobile",
    "apps",
    "Mobile application",
    75000,
    "An installed app designed around your customers and business.",
    ["Mobile interface", "Core app workflows", "Platform scope confirmation"],
  ),
  system(
    "game",
    "apps",
    "Game development",
    90000,
    "Bring a scoped game concept and gameplay loop to life.",
    ["Gameplay prototype", "Core mechanics", "Platform scope confirmation"],
  ),
  system(
    "automation",
    "apps",
    "Workflow automation",
    20000,
    "Automate repetitive tasks and connect business workflows.",
    ["Workflow mapping", "Automated tasks", "Run status reporting"],
  ),
  system(
    "design",
    "design",
    "UI/UX design",
    15000,
    "Research and design an intuitive digital experience.",
    ["User flows", "Interface design", "Interactive prototype"],
  ),
  system(
    "other",
    "custom",
    "Others / Custom system",
    null,
    "Can't find your system? Describe what you need.",
    ["Requirements discussion", "Custom scope and quotation"],
  ),
] as const;

export type SystemId = (typeof systemDefinitions)[number]["id"];

function addon<const Id extends string>(
  id: Id,
  label: string,
  pesos: number,
  description: string,
  billing: "once" | "year" | "month" = "once",
) {
  return { id, label, priceCents: pesos * 100, description, billing };
}

export const addonDefinitions = [
  addon(
    "cms",
    "Full CMS",
    8000,
    "Manage and publish your landing page content.",
  ),
  addon("seo", "SEO setup", 4000, "Initial on-page search optimization."),
  addon(
    "analytics",
    "Analytics setup",
    1500,
    "Connect website traffic and conversion reporting.",
  ),
  addon(
    "ecommerce",
    "E-commerce module",
    12000,
    "Add product, cart, and order workflows.",
  ),
  addon(
    "booking",
    "Booking module",
    8000,
    "Add availability and reservation workflows.",
  ),
  addon(
    "payments",
    "Payment gateway integration",
    8000,
    "Connect a payment provider; transaction fees are separate.",
  ),
  addon(
    "api",
    "External API integration",
    8000,
    "Connect an external service; scope confirmed before quotation.",
  ),
  addon(
    "notifications",
    "Email/push notification integration",
    5000,
    "Add notification delivery; provider subscriptions and usage are separate.",
  ),
  addon(
    "migration",
    "Data migration",
    6000,
    "Import existing records; volume and format confirmed during scoping.",
  ),
  addon(
    "ordering",
    "Online / table ordering",
    8000,
    "Let customers place menu orders online.",
  ),
  addon(
    "gallery",
    "Guest photo gallery",
    5000,
    "Share an event photo collection with guests.",
  ),
  addon(
    "business-email",
    "Business email setup",
    1500,
    "One setup per project; mailbox subscriptions are separate.",
  ),
  addon(
    "domain",
    "Domain",
    1200,
    "One domain for one year; availability and renewal confirmed separately.",
    "year",
  ),
  addon(
    "local-setup",
    "Local installation/setup",
    5000,
    "Install on your own PC/server within your office network. Hardware and remote access are separate.",
  ),
  addon(
    "web-hosting",
    "Web hosting",
    500,
    "Online hosting for the selected term.",
    "month",
  ),
  addon(
    "maintenance",
    "Maintenance",
    2000,
    "Ongoing support for the selected term; coverage confirmed during scoping.",
    "month",
  ),
] as const;

export type AddonId = (typeof addonDefinitions)[number]["id"];
const priceSchema = z.number().int().min(0).max(999_999_999);
const editableFields = {
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  enabled: z.boolean(),
};

const systemPriceSchema = z
  .object({
    ...editableFields,
    id: z.enum(systemDefinitions.map((item) => item.id)),
    priceCents: priceSchema.nullable(),
  })
  .superRefine((item, ctx) => {
    if ((item.id === "other") !== (item.priceCents === null))
      ctx.addIssue({
        code: "custom",
        path: ["priceCents"],
        message: "Only custom systems use an unpriced quote.",
      });
  });
const addonPriceSchema = z.object({
  ...editableFields,
  id: z.enum(addonDefinitions.map((item) => item.id)),
  priceCents: priceSchema,
});

export const projectEstimatorSchema = z
  .object({
    systems: z.array(systemPriceSchema).length(systemDefinitions.length),
    addons: z.array(addonPriceSchema).length(addonDefinitions.length),
  })
  .superRefine((catalog, ctx) => {
    for (const key of ["systems", "addons"] as const) {
      if (
        new Set(catalog[key].map((item) => item.id)).size !==
        catalog[key].length
      )
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Catalog identifiers must be unique and complete.",
        });
    }
  });

export type ProjectEstimatorCatalog = z.infer<typeof projectEstimatorSchema>;
export type SystemPrice = ProjectEstimatorCatalog["systems"][number];
export type AddonPrice = ProjectEstimatorCatalog["addons"][number];

export const defaultEstimatorCatalog: ProjectEstimatorCatalog = {
  systems: systemDefinitions.map(({ id, label, description, priceCents }) => ({
    id,
    label,
    description,
    priceCents,
    enabled: true,
  })),
  addons: addonDefinitions.map(({ id, label, description, priceCents }) => ({
    id,
    label,
    description,
    priceCents,
    enabled: true,
  })),
};

export function isAddonEligible(systemId: SystemId, addonId: AddonId): boolean {
  const definition = systemDefinitions.find((item) => item.id === systemId);
  const business =
    definition &&
    ["inventory", "sales", "operations"].includes(definition.group);
  const website = [
    "landing",
    "promotional",
    "ecommerce",
    "menu",
    "wedding-web",
  ].includes(systemId);
  const mobile = systemId === "mobile" || systemId === "wedding-mobile";
  switch (addonId) {
    case "cms":
      return systemId === "landing";
    case "seo":
    case "analytics":
      return website;
    case "ecommerce":
    case "booking":
      return systemId === "promotional";
    case "payments":
      return Boolean(
        business ||
        mobile ||
        systemId === "promotional" ||
        systemId === "ecommerce",
      );
    case "api":
    case "notifications":
    case "migration":
      return Boolean(
        business ||
        mobile ||
        ["wedding-web", "photobooth", "automation"].includes(systemId),
      );
    case "ordering":
      return systemId === "menu" || systemId === "restaurant";
    case "gallery":
      return ["wedding-web", "wedding-mobile", "photobooth"].includes(systemId);
    default:
      return false;
  }
}

export function formatEstimatePrice(cents: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
