"use client";

import { useState } from "react";
import {
  addonDefinitions,
  estimatorGroups,
  systemDefinitions,
  type ProjectEstimatorCatalog,
} from "@/features/services/estimator/catalog";

type PriceItem =
  | ProjectEstimatorCatalog["systems"][number]
  | ProjectEstimatorCatalog["addons"][number];

function PriceFields({
  item,
  caption,
  onChange,
}: {
  item: PriceItem;
  caption: string;
  onChange: (
    patch: Partial<
      Pick<PriceItem, "label" | "description" | "priceCents" | "enabled">
    >,
  ) => void;
}): React.ReactNode {
  const invalid =
    item.priceCents !== null &&
    (!Number.isSafeInteger(item.priceCents) ||
      item.priceCents < 0 ||
      item.priceCents > 999_999_999);
  return (
    <fieldset className="min-w-0 space-y-3 rounded-md border p-3">
      <legend className="px-1 text-sm font-semibold">
        {item.label || item.id}
      </legend>
      <p className="text-xs text-muted-foreground">{caption}</p>
      <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={item.enabled}
          onChange={(event) => onChange({ enabled: event.target.checked })}
        />
        <span>Available to customers</span>
      </label>
      <label className="block space-y-1 text-sm">
        <span>Label</span>
        <input
          value={item.label}
          maxLength={120}
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Description</span>
        <textarea
          value={item.description}
          rows={3}
          maxLength={500}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>
      {item.priceCents === null ? (
        <p className="text-sm">Custom quote — no fixed price</p>
      ) : (
        <label className="block space-y-1 text-sm">
          <span>Price (PHP)</span>
          <input
            type="number"
            min="0"
            max="9999999.99"
            step="0.01"
            aria-invalid={invalid}
            value={invalid ? "" : item.priceCents / 100}
            onChange={(event) => {
              const raw = event.target.value;
              const pesos = Number(raw);
              const cents = Math.round(pesos * 100);
              onChange({
                priceCents:
                  raw !== "" &&
                  Number.isFinite(pesos) &&
                  pesos >= 0 &&
                  Math.abs(pesos * 100 - cents) < 0.00001
                    ? cents
                    : -1,
              });
            }}
          />
          {invalid && (
            <span role="alert" className="block text-destructive">
              Enter a non-negative PHP price with at most two decimals.
            </span>
          )}
        </label>
      )}
    </fieldset>
  );
}

export function PricingPanel({
  catalog,
  onChange,
}: {
  catalog: ProjectEstimatorCatalog;
  onChange: (catalog: ProjectEstimatorCatalog) => void;
}): React.ReactNode {
  const [search, setSearch] = useState("");
  const matches = (item: PriceItem) =>
    `${item.label} ${item.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  return (
    <section aria-label="Project estimator pricing" className="space-y-4">
      <div>
        <h2 className="font-semibold">Project estimator pricing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit sample PHP prices and availability. Changes follow the existing
          draft, preview, publish, and history workflow.
        </p>
      </div>
      <label className="block space-y-1 text-sm">
        <span>Find a system or add-on</span>
        <input
          type="search"
          value={search}
          maxLength={120}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <h3 className="text-sm font-semibold">Systems & services</h3>
      {catalog.systems.filter(matches).map((item) => {
        const definition = systemDefinitions.find(
          (entry) => entry.id === item.id,
        );
        return (
          <PriceFields
            key={item.id}
            item={item}
            caption={definition ? estimatorGroups[definition.group] : "System"}
            onChange={(patch) =>
              onChange({
                ...catalog,
                systems: catalog.systems.map((entry) =>
                  entry.id === item.id ? { ...entry, ...patch } : entry,
                ),
              })
            }
          />
        );
      })}
      <h3 className="text-sm font-semibold">Add-ons & shared services</h3>
      {catalog.addons.filter(matches).map((item) => {
        const definition = addonDefinitions.find(
          (entry) => entry.id === item.id,
        );
        const billing =
          definition?.billing === "month"
            ? "Per month"
            : definition?.billing === "year"
              ? "One year"
              : "One-time";
        return (
          <PriceFields
            key={item.id}
            item={item}
            caption={`${billing} · billing units and eligible systems are fixed`}
            onChange={(patch) => {
              const { priceCents, ...rest } = patch;
              onChange({
                ...catalog,
                addons: catalog.addons.map((entry) =>
                  entry.id === item.id
                    ? {
                        ...entry,
                        ...rest,
                        ...(priceCents !== undefined && priceCents !== null
                          ? { priceCents }
                          : {}),
                      }
                    : entry,
                ),
              });
            }}
          />
        );
      })}
      {!catalog.systems.some(matches) && !catalog.addons.some(matches) && (
        <p role="status" className="text-sm text-muted-foreground">
          No matching pricing entries.
        </p>
      )}
    </section>
  );
}
