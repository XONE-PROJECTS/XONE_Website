import {
  defaultEstimatorCatalog,
  isAddonEligible,
  type AddonId,
  type ProjectEstimatorCatalog,
  type SystemId,
} from "./catalog";

export const termMonths = [1, 3, 6, 12] as const;
export type TermMonths = (typeof termMonths)[number];
export type EstimatorSelection = {
  systemIds: SystemId[];
  addons: Partial<Record<SystemId, AddonId[]>>;
  hosting: "none" | "local" | "web";
  hostingMonths: TermMonths;
  maintenance: boolean;
  maintenanceMonths: TermMonths;
  domain: boolean;
  businessEmail: boolean;
};
export type EstimateLine = {
  id: string;
  label: string;
  category: "development" | "setup" | "domain" | "hosting" | "maintenance";
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
  term: string;
};
export type ProjectEstimate = {
  lines: EstimateLine[];
  totalCents: number;
  customQuoteRequired: boolean;
};

export function createEstimatorSelection(): EstimatorSelection {
  return {
    systemIds: [],
    addons: {},
    hosting: "none",
    hostingMonths: 1,
    maintenance: false,
    maintenanceMonths: 1,
    domain: false,
    businessEmail: false,
  };
}

export function normalizeSelection(
  selection: EstimatorSelection,
  catalog: ProjectEstimatorCatalog,
): EstimatorSelection {
  const systemIds = [...new Set(selection.systemIds)].filter((id) =>
    catalog.systems.some((item) => item.id === id && item.enabled),
  );
  const addons: EstimatorSelection["addons"] = {};
  for (const id of systemIds) {
    addons[id] = [...new Set(selection.addons[id] ?? [])].filter(
      (addonId) =>
        isAddonEligible(id, addonId) &&
        catalog.addons.some((item) => item.id === addonId && item.enabled),
    );
  }
  const enabled = (id: AddonId): boolean =>
    catalog.addons.some((item) => item.id === id && item.enabled);
  return {
    ...selection,
    systemIds,
    addons,
    hosting:
      selection.hosting === "local" && enabled("local-setup")
        ? "local"
        : selection.hosting === "web" && enabled("web-hosting")
          ? "web"
          : "none",
    hostingMonths: termMonths.includes(selection.hostingMonths)
      ? selection.hostingMonths
      : 1,
    maintenanceMonths: termMonths.includes(selection.maintenanceMonths)
      ? selection.maintenanceMonths
      : 1,
    maintenance: selection.maintenance && enabled("maintenance"),
    domain: selection.domain && enabled("domain"),
    businessEmail: selection.businessEmail && enabled("business-email"),
  };
}

export function toggleSystem(
  selection: EstimatorSelection,
  id: SystemId,
): EstimatorSelection {
  if (!selection.systemIds.includes(id))
    return { ...selection, systemIds: [...selection.systemIds, id] };
  const addons = { ...selection.addons };
  delete addons[id];
  return {
    ...selection,
    systemIds: selection.systemIds.filter((value) => value !== id),
    addons,
  };
}

export function calculateEstimate(
  selection: EstimatorSelection,
  catalog: ProjectEstimatorCatalog = defaultEstimatorCatalog,
): ProjectEstimate {
  const selected = normalizeSelection(selection, catalog);
  const lines: EstimateLine[] = [];
  function add(
    id: string,
    label: string,
    category: EstimateLine["category"],
    unitPriceCents: number,
    quantity = 1,
    term = "one-time",
  ): void {
    lines.push({
      id,
      label,
      category,
      unitPriceCents,
      quantity,
      totalCents: unitPriceCents * quantity,
      term,
    });
  }
  for (const id of selected.systemIds) {
    const item = catalog.systems.find((system) => system.id === id);
    if (!item) continue;
    if (item.priceCents !== null)
      add(id, item.label, "development", item.priceCents);
    for (const addonId of selected.addons[id] ?? []) {
      const addon = catalog.addons.find((entry) => entry.id === addonId);
      if (addon)
        add(
          `${id}:${addonId}`,
          `${item.label} — ${addon.label}`,
          "development",
          addon.priceCents,
        );
    }
  }
  function shared(
    id: AddonId,
    category: EstimateLine["category"],
    quantity = 1,
    term = "one-time",
  ): void {
    const item = catalog.addons.find(
      (entry) => entry.id === id && entry.enabled,
    );
    if (item) add(id, item.label, category, item.priceCents, quantity, term);
  }
  if (selected.businessEmail) shared("business-email", "setup");
  if (selected.domain) shared("domain", "domain", 1, "one year");
  if (selected.hosting === "local") shared("local-setup", "setup");
  if (selected.hosting === "web")
    shared(
      "web-hosting",
      "hosting",
      selected.hostingMonths,
      `${selected.hostingMonths} month(s)`,
    );
  if (selected.maintenance)
    shared(
      "maintenance",
      "maintenance",
      selected.maintenanceMonths,
      `${selected.maintenanceMonths} month(s)`,
    );
  return {
    lines,
    totalCents: lines.reduce((total, line) => total + line.totalCents, 0),
    customQuoteRequired: selected.systemIds.includes("other"),
  };
}
