import { describe, expect, it } from "vitest";
import {
  defaultEstimatorCatalog,
  formatEstimatePrice,
  isAddonEligible,
  projectEstimatorSchema,
  systemDefinitions,
} from "@/features/services/estimator/catalog";
import {
  calculateEstimate,
  createEstimatorSelection,
  normalizeSelection,
  termMonths,
  toggleSystem,
} from "@/features/services/estimator/pricing";
import {
  buildEstimateSummary,
  createProjectDetails,
  projectDetailsSchema,
  validateProjectInquiry,
} from "@/features/services/estimator/inquiry";
import {
  defaultContent,
  isDefaultContent,
  parseSiteContent,
} from "@/features/admin/lib/content";
import { buildContactMailto, CONTACT_EMAIL } from "@/lib/brand";

describe("project estimator catalog", () => {
  it("contains the expanded system catalog and separate unpriced custom option", () => {
    expect(
      projectEstimatorSchema.parse(defaultEstimatorCatalog).systems,
    ).toHaveLength(33);
    expect(systemDefinitions.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "procurement",
        "warehouse",
        "inventory",
        "crm",
        "sales",
        "erp",
        "accounting",
        "finance",
        "hotel",
        "hris",
        "learners",
        "wedding-web",
        "wedding-mobile",
        "photobooth",
        "menu",
      ]),
    );
    expect(
      defaultEstimatorCatalog.systems.find((item) => item.id === "other")
        ?.priceCents,
    ).toBeNull();
  });

  it("adds learners to older catalogs without changing existing prices", () => {
    const catalog = structuredClone(defaultEstimatorCatalog);
    catalog.systems = catalog.systems.filter((item) => item.id !== "learners");
    catalog.systems[0].priceCents = 987_654;
    const updated = projectEstimatorSchema.parse(catalog);
    expect(updated.systems[0].priceCents).toBe(987_654);
    expect(
      updated.systems.find((item) => item.id === "learners"),
    ).toMatchObject({
      priceCents: 6_000_000,
      enabled: true,
    });
    catalog.systems.pop();
    expect(projectEstimatorSchema.safeParse(catalog).success).toBe(false);
  });

  it.each([-1, 1.5, Infinity, NaN, 1_000_000_000])(
    "rejects invalid centavo price %s",
    (priceCents) => {
      const catalog = structuredClone(defaultEstimatorCatalog);
      catalog.systems[0].priceCents = priceCents;
      expect(projectEstimatorSchema.safeParse(catalog).success).toBe(false);
    },
  );

  it("rejects duplicate, missing, unknown, and incorrectly unpriced items", () => {
    const duplicate = structuredClone(defaultEstimatorCatalog);
    duplicate.systems[1] = duplicate.systems[0];
    expect(projectEstimatorSchema.safeParse(duplicate).success).toBe(false);
    expect(
      projectEstimatorSchema.safeParse({
        ...defaultEstimatorCatalog,
        addons: [],
      }).success,
    ).toBe(false);
    expect(
      projectEstimatorSchema.safeParse({
        ...defaultEstimatorCatalog,
        systems: [
          ...defaultEstimatorCatalog.systems.slice(1),
          { ...defaultEstimatorCatalog.systems[0], id: "unknown" },
        ],
      }).success,
    ).toBe(false);
    const unpriced = structuredClone(defaultEstimatorCatalog);
    unpriced.systems[0].priceCents = null;
    expect(projectEstimatorSchema.safeParse(unpriced).success).toBe(false);
  });

  it("offers appropriate upgrades without selling included features again", () => {
    expect(isAddonEligible("landing", "cms")).toBe(true);
    expect(isAddonEligible("promotional", "cms")).toBe(false);
    expect(isAddonEligible("ecommerce", "ecommerce")).toBe(false);
    expect(isAddonEligible("booking", "booking")).toBe(false);
    expect(isAddonEligible("menu", "ordering")).toBe(true);
    expect(isAddonEligible("photobooth", "gallery")).toBe(true);
    expect(isAddonEligible("wedding-web", "gallery")).toBe(true);
    expect(isAddonEligible("accounting", "migration")).toBe(true);
    expect(isAddonEligible("design", "payments")).toBe(false);
  });
});

describe("project estimate calculations", () => {
  it("prices learners with eligible notification add-ons", () => {
    const estimate = calculateEstimate({
      ...createEstimatorSelection(),
      systemIds: ["learners"],
      addons: { learners: ["notifications"] },
    });
    expect(estimate.totalCents).toBe(6_500_000);
    expect(estimate.lines[0].label).toBe("Learners Module System (LMS)");
  });

  it("adds several systems, scoped upgrades, and shared services once", () => {
    const selection = createEstimatorSelection();
    selection.systemIds = ["landing", "pos"];
    selection.addons = { landing: ["cms", "analytics"], pos: ["payments"] };
    selection.hosting = "web";
    selection.hostingMonths = 3;
    selection.maintenance = true;
    selection.maintenanceMonths = 6;
    selection.domain = true;
    selection.businessEmail = true;
    const estimate = calculateEstimate(selection);
    expect(estimate.totalCents).toBe(
      (12000 + 45000 + 8000 + 1500 + 8000 + 1500 + 1200 + 500 * 3 + 2000 * 6) *
        100,
    );
    expect(estimate.lines.filter((line) => line.id === "domain")).toHaveLength(
      1,
    );
    expect(
      estimate.lines.filter((line) => line.id === "business-email"),
    ).toHaveLength(1);
  });

  it.each(termMonths)(
    "calculates %i-month hosting and maintenance independently",
    (months) => {
      const selection = {
        ...createEstimatorSelection(),
        hosting: "web" as const,
        hostingMonths: months,
        maintenance: true,
        maintenanceMonths: months,
      };
      expect(calculateEstimate(selection).totalCents).toBe(
        (500 + 2000) * months * 100,
      );
    },
  );

  it("switches between web, local, and no hosting without duplicate setup or hidden hosting charges", () => {
    const selection = {
      ...createEstimatorSelection(),
      hosting: "web" as const,
      hostingMonths: 12 as const,
      maintenance: true,
      maintenanceMonths: 3 as const,
    };
    expect(calculateEstimate(selection).totalCents).toBe(12000 * 100);
    const local = calculateEstimate({ ...selection, hosting: "local" });
    expect(local.totalCents).toBe((5000 + 6000) * 100);
    expect(local.lines.some((line) => line.id === "web-hosting")).toBe(false);
    expect(
      calculateEstimate({ ...selection, hosting: "none" }).totalCents,
    ).toBe(6000 * 100);
  });

  it("removes scoped upgrades and does not resurrect them on reselection", () => {
    const selection = {
      ...createEstimatorSelection(),
      systemIds: ["landing" as const],
      addons: { landing: ["cms" as const] },
    };
    const removed = toggleSystem(selection, "landing");
    expect(removed.addons.landing).toBeUndefined();
    expect(calculateEstimate(toggleSystem(removed, "landing")).totalCents).toBe(
      12000 * 100,
    );
  });

  it("ignores disabled options, orphan upgrades, duplicates, and ineligible upgrades", () => {
    const catalog = structuredClone(defaultEstimatorCatalog);
    catalog.systems.find((item) => item.id === "pos")!.enabled = false;
    catalog.addons.find((item) => item.id === "local-setup")!.enabled = false;
    const selection = {
      ...createEstimatorSelection(),
      systemIds: ["landing" as const, "landing" as const, "pos" as const],
      addons: {
        landing: ["cms" as const, "cms" as const, "payments" as const],
        pos: ["payments" as const],
      },
      hosting: "local" as const,
    };
    expect(normalizeSelection(selection, catalog).hosting).toBe("none");
    expect(calculateEstimate(selection, catalog).totalCents).toBe(20000 * 100);
  });

  it("uses published/editor prices with exact centavo arithmetic", () => {
    const catalog = structuredClone(defaultEstimatorCatalog);
    catalog.systems[0].priceCents = 123_456;
    expect(
      calculateEstimate(
        { ...createEstimatorSelection(), systemIds: ["landing"] },
        catalog,
      ).totalCents,
    ).toBe(123_456);
    expect(formatEstimatePrice(123_456)).toContain("1,234.56");
  });

  it("keeps custom work unpriced alone and alongside priced work", () => {
    const custom = calculateEstimate({
      ...createEstimatorSelection(),
      systemIds: ["other"],
    });
    expect(custom).toMatchObject({
      customQuoteRequired: true,
      lines: [],
      totalCents: 0,
    });
    expect(
      calculateEstimate({
        ...createEstimatorSelection(),
        systemIds: ["landing", "other"],
      }),
    ).toMatchObject({ customQuoteRequired: true, totalCents: 12000 * 100 });
  });
});

describe("project inquiry and compatibility", () => {
  const details = {
    ...createProjectDetails(),
    name: "Sample Client",
    email: " CLIENT@EXAMPLE.COM ",
    projectName: "Stock & Sales",
    description: "A stock system for our shop.",
    customDescription: "A custom supplier portal",
  };

  it("validates required details, normalizes email, and rejects unsafe input", () => {
    expect(projectDetailsSchema.parse(details).email).toBe(
      "client@example.com",
    );
    expect(
      validateProjectInquiry(
        createProjectDetails(),
        createEstimatorSelection(),
      ),
    ).toHaveProperty("systems");
    expect(
      projectDetailsSchema.safeParse({ ...details, name: "<script>" }).success,
    ).toBe(false);
    expect(
      projectDetailsSchema.safeParse({
        ...details,
        description: "hidden\u202Etext here",
      }).success,
    ).toBe(false);
    expect(
      projectDetailsSchema.safeParse({
        ...details,
        description: "a".repeat(2001),
      }).success,
    ).toBe(false);
    expect(
      validateProjectInquiry(
        { ...details, customDescription: "short" },
        { ...createEstimatorSelection(), systemIds: ["other"] },
      ),
    ).toHaveProperty("customDescription");
  });

  it("builds an itemized copy/email summary including local hosting and custom work", () => {
    const summary = buildEstimateSummary(
      details,
      {
        ...createEstimatorSelection(),
        systemIds: ["landing", "other"],
        hosting: "local",
        maintenance: true,
        maintenanceMonths: 6,
      },
      defaultEstimatorCatalog,
    );
    expect(summary).toContain("Local / On-premise");
    expect(summary).toContain("6 month(s)");
    expect(summary).toContain("Estimated subtotal");
    expect(summary).toContain(
      "Custom quote required: A custom supplier portal",
    );
    const mailto = buildContactMailto("Stock & Sales", undefined, summary);
    const params = new URLSearchParams(mailto.split("?")[1]);
    expect(params.get("body")).toBe(summary);
    expect(params.get("subject")).toBe("Stock & Sales");
    expect(buildContactMailto()).toBe(
      `mailto:${CONTACT_EMAIL}?subject=Project+inquiry`,
    );
  });

  it("defaults older CMS documents without changing their pages or renderer selection", () => {
    const legacy: Partial<typeof defaultContent> =
      structuredClone(defaultContent);
    delete legacy.projectEstimator;
    const content = parseSiteContent(legacy);
    expect(content.projectEstimator).toEqual(defaultEstimatorCatalog);
    const independent = parseSiteContent(legacy);
    expect(content.pages).toEqual(parseSiteContent(defaultContent).pages);
    content.projectEstimator.systems[0].priceCents = 900_000;
    expect(independent.projectEstimator.systems[0].priceCents).toBe(1_200_000);
    expect(defaultEstimatorCatalog.systems[0].priceCents).toBe(1_200_000);
    expect(isDefaultContent(content)).toBe(true);
    expect(
      parseSiteContent(content).projectEstimator.systems[0].priceCents,
    ).toBe(900_000);
  });
});
