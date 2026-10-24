"use client";

import { useState } from "react";
import {
  estimatorGroups,
  formatEstimatePrice,
  isAddonEligible,
  systemDefinitions,
  type AddonId,
  type EstimatorGroup,
  type ProjectEstimatorCatalog,
  type SystemId,
} from "../estimator/catalog";
import type { EstimatorSelection } from "../estimator/pricing";
import { estimatorInputClass } from "./EstimatorDetails";

export function EstimatorCatalog({
  catalog,
  selection,
  onSystem,
  onAddon,
  prefix,
}: {
  catalog: ProjectEstimatorCatalog;
  selection: EstimatorSelection;
  onSystem: (id: SystemId) => void;
  onAddon: (id: SystemId, addon: AddonId) => void;
  prefix: string;
}): React.ReactNode {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<EstimatorGroup | "all">("all");
  const available = catalog.systems.filter((item) => item.enabled);
  const matches = available.filter((item) => {
    const definition = systemDefinitions.find((entry) => entry.id === item.id);
    return (
      definition &&
      (group === "all" || definition.group === group) &&
      `${item.label} ${item.description} ${estimatorGroups[definition.group]}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  });
  return (
    <section aria-labelledby={`${prefix}-systems`} className="space-y-4">
      <div>
        <h3 id={`${prefix}-systems`} className="text-lg font-semibold">
          Systems & services
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose as many as you need. Add-ons apply to the system they appear
          under.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`${prefix}-search`}
            className="block text-sm font-medium"
          >
            Search systems
          </label>
          <input
            id={`${prefix}-search`}
            type="search"
            placeholder="Try inventory, wedding, CRM…"
            className={estimatorInputClass}
            value={search}
            maxLength={120}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${prefix}-category`}
            className="block text-sm font-medium"
          >
            Category
          </label>
          <select
            id={`${prefix}-category`}
            className={estimatorInputClass}
            value={group}
            onChange={(event) =>
              setGroup(event.target.value as EstimatorGroup | "all")
            }
          >
            <option value="all">All categories</option>
            {Object.entries(estimatorGroups).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {matches.length} options · {selection.systemIds.length} selected
      </p>
      {!matches.length && (
        <p
          role="status"
          className="rounded-md border border-dashed p-4 text-sm"
        >
          No matching systems. Try another search or choose Others / Custom
          system below.
        </p>
      )}
      <div className="space-y-3">
        {matches.map((item) => {
          const definition = systemDefinitions.find(
            (entry) => entry.id === item.id,
          );
          const selected = selection.systemIds.includes(item.id);
          const addons = catalog.addons.filter(
            (addon) => addon.enabled && isAddonEligible(item.id, addon.id),
          );
          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-lg border transition ${selected ? "border-xone-violet bg-xone-accent-muted/30" : "border-border bg-background hover:border-xone-violet/50"}`}
            >
              <label className="flex min-h-11 cursor-pointer items-start gap-3 p-4">
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-xone-violet"
                  aria-label={item.label}
                  checked={selected}
                  onChange={() => onSystem(item.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-sm font-semibold text-xone-violet">
                      {item.priceCents === null
                        ? "Custom quote required"
                        : formatEstimatePrice(item.priceCents)}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                    {definition?.features.join(" · ")}
                  </span>
                </span>
              </label>
              {selected && addons.length > 0 && (
                <fieldset className="space-y-1 border-t border-border px-4 pb-3">
                  <legend className="px-1 text-sm font-medium">
                    Add-ons for {item.label}
                  </legend>
                  {addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 size-5 shrink-0 accent-xone-violet"
                        checked={
                          selection.addons[item.id]?.includes(addon.id) ?? false
                        }
                        onChange={() => onAddon(item.id, addon.id)}
                        aria-label={`${addon.label} for ${item.label}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{addon.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {addon.description}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium">
                        +{formatEstimatePrice(addon.priceCents)}
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
          );
        })}
      </div>
      {available.some((item) => item.id === "other") &&
        !matches.some((item) => item.id === "other") && (
          <button
            type="button"
            className="min-h-11 text-left text-sm font-medium text-xone-violet underline underline-offset-4 active:opacity-70"
            onClick={() => {
              setSearch("");
              setGroup("custom");
            }}
          >
            Can’t find your system? Describe what you need.
          </button>
        )}
    </section>
  );
}
