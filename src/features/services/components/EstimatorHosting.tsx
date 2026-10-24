import {
  formatEstimatePrice,
  type AddonId,
  type ProjectEstimatorCatalog,
} from "../estimator/catalog";
import {
  termMonths,
  type EstimatorSelection,
  type TermMonths,
} from "../estimator/pricing";
import { estimatorInputClass } from "./EstimatorDetails";

function TermSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: TermMonths;
  onChange: (months: TermMonths) => void;
}): React.ReactNode {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        className={estimatorInputClass}
        onChange={(event) => onChange(Number(event.target.value) as TermMonths)}
      >
        {termMonths.map((months) => (
          <option key={months} value={months}>
            {months} {months === 1 ? "month" : "months"}
          </option>
        ))}
      </select>
    </div>
  );
}

export function EstimatorHosting({
  catalog,
  selection,
  onChange,
  prefix,
}: {
  catalog: ProjectEstimatorCatalog;
  selection: EstimatorSelection;
  onChange: (patch: Partial<EstimatorSelection>) => void;
  prefix: string;
}): React.ReactNode {
  const get = (id: AddonId) => catalog.addons.find((item) => item.id === id);
  const local = get("local-setup"),
    web = get("web-hosting");
  const shared = [
    { id: "domain", key: "domain", suffix: "/year" },
    { id: "business-email", key: "businessEmail", suffix: " once" },
    { id: "maintenance", key: "maintenance", suffix: "/month" },
  ] as const;
  return (
    <section aria-labelledby={`${prefix}-hosting`} className="space-y-4">
      <div>
        <h3 id={`${prefix}-hosting`} className="text-lg font-semibold">
          Hosting & shared services
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          These options are charged once per project, not for every selected
          system.
        </p>
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Hosting choice</legend>
        {(
          [
            {
              id: "none",
              label: "Not required",
              description:
                "You already have hosting or will arrange it separately.",
              price: "",
              enabled: true,
            },
            {
              id: "local",
              label: "Local / On-premise",
              description: local?.description ?? "",
              price: local
                ? `${local.label}: ${formatEstimatePrice(local.priceCents)} once`
                : "",
              enabled: local?.enabled ?? false,
            },
            {
              id: "web",
              label: web?.label ?? "Web hosting",
              description: web?.description ?? "",
              price: web ? `${formatEstimatePrice(web.priceCents)}/month` : "",
              enabled: web?.enabled ?? false,
            },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className={`flex min-h-11 items-start gap-3 rounded-lg border p-3 ${option.enabled ? "cursor-pointer" : "opacity-50"} ${selection.hosting === option.id ? "border-xone-violet bg-xone-accent-muted/30" : "border-border"}`}
          >
            <input
              type="radio"
              name={`${prefix}-hosting-choice`}
              aria-label={option.id === "web" ? "Web hosting" : option.label}
              className="mt-1 size-5 shrink-0 accent-xone-violet"
              checked={selection.hosting === option.id}
              disabled={!option.enabled}
              onChange={() => onChange({ hosting: option.id })}
            />
            <span className="min-w-0 text-sm">
              <span className="font-medium">{option.label}</span>
              {!option.enabled && <span> — unavailable</span>}
              <span className="block text-muted-foreground">
                {option.description}
              </span>
              {option.price && (
                <span className="mt-1 block font-medium">{option.price}</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      {selection.hosting === "web" && (
        <TermSelect
          id={`${prefix}-hosting-term`}
          label="Web hosting duration"
          value={selection.hostingMonths}
          onChange={(hostingMonths) => onChange({ hostingMonths })}
        />
      )}
      <div className="space-y-2">
        {shared.map((option) => {
          const item = get(option.id);
          if (!item?.enabled) return null;
          return (
            <label
              key={option.id}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
            >
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 accent-xone-violet"
                aria-label={item.label}
                checked={selection[option.key]}
                onChange={(event) =>
                  onChange({ [option.key]: event.target.checked })
                }
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-medium">
                  {item.label} · {formatEstimatePrice(item.priceCents)}
                  {option.suffix}
                </span>
                <span className="block text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {selection.maintenance && (
        <TermSelect
          id={`${prefix}-maintenance-term`}
          label="Maintenance duration"
          value={selection.maintenanceMonths}
          onChange={(maintenanceMonths) => onChange({ maintenanceMonths })}
        />
      )}
    </section>
  );
}
