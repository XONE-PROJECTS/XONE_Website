import { Button } from "@/components/ui/button";
import {
  formatEstimatePrice,
  type ProjectEstimatorCatalog,
} from "../estimator/catalog";
import type { EstimatorSelection, ProjectEstimate } from "../estimator/pricing";

const categories = {
  development: "Development",
  setup: "One-time setup",
  domain: "Domain",
  hosting: "Web hosting",
  maintenance: "Maintenance",
} as const;

export function EstimatorSummary({
  estimate,
  selection,
  catalog,
  onCopy,
  onReset,
  status,
  fallback,
  formId,
}: {
  estimate: ProjectEstimate;
  selection: EstimatorSelection;
  catalog: ProjectEstimatorCatalog;
  onCopy: () => void;
  onReset: () => void;
  status: string;
  fallback: string;
  formId: string;
}): React.ReactNode {
  return (
    <aside
      aria-label="Estimate breakdown"
      className="min-w-0 self-start rounded-lg border border-border bg-muted/40 p-4 lg:sticky lg:top-4"
    >
      <h3 className="text-lg font-semibold">Your project estimate</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Sample PHP pricing. Final scope and pricing require confirmation.
      </p>
      {selection.systemIds.length > 0 || estimate.lines.length > 0 ? (
        <div className="mt-4 space-y-4">
          {selection.systemIds.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Selected systems
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {selection.systemIds.map((id) => (
                  <li key={id} className="break-words">
                    {catalog.systems.find((item) => item.id === id)?.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Object.entries(categories).map(([category, label]) => {
            const lines = estimate.lines.filter(
              (line) => line.category === category,
            );
            if (!lines.length) return null;
            return (
              <div key={category}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </h4>
                <dl className="mt-2 space-y-3 text-sm">
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <dt className="min-w-0 break-words">
                        {line.label}
                        <span className="block text-xs text-muted-foreground">
                          {line.term}
                          {line.category === "hosting" ||
                          line.category === "maintenance"
                            ? ` · ${formatEstimatePrice(line.unitPriceCents)}/month`
                            : ""}
                        </span>
                      </dt>
                      <dd className="shrink-0 font-medium">
                        {formatEstimatePrice(line.totalCents)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="my-5 text-sm text-muted-foreground">
          Choose a system to start building your estimate.
        </p>
      )}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-sm font-medium">
          {estimate.customQuoteRequired
            ? "Estimated subtotal"
            : "Estimated total"}
        </p>
        <p className="mt-1 break-words text-2xl font-semibold text-xone-violet">
          {formatEstimatePrice(estimate.totalCents)}
        </p>
        {estimate.customQuoteRequired && (
          <p className="mt-2 text-sm font-medium">
            Custom quote required for Others / Custom system.
          </p>
        )}
      </div>
      <div className="mt-4 grid gap-2">
        <Button
          type="submit"
          form={formId}
          className="min-h-11 whitespace-normal"
        >
          Email project inquiry
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={!selection.systemIds.length}
          onClick={onCopy}
        >
          Copy estimate
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={onReset}
        >
          Reset estimate
        </Button>
      </div>
      <p role="status" className="mt-3 text-sm">
        {status}
      </p>
      {fallback && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`${formId}-copy`} className="text-sm font-medium">
            Select and copy your estimate
          </label>
          <textarea
            id={`${formId}-copy`}
            readOnly
            value={fallback}
            rows={7}
            className="w-full rounded-md border bg-background p-2 text-sm"
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Email opens a draft in your email app. Nothing is sent automatically. If
        it does not open, use Copy estimate.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Hardware, remote access, subscriptions, renewals, transaction fees, and
        usage charges require separate confirmation.
      </p>
    </aside>
  );
}
