"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildContactMailto } from "@/lib/brand";
import {
  formatEstimatePrice,
  type ProjectEstimatorCatalog,
} from "../estimator/catalog";
import { useEstimatorConfig } from "../estimator/EstimatorProvider";
import {
  buildEstimateSummary,
  projectDetailsSchema,
  validateProjectInquiry,
  type InquiryErrors,
} from "../estimator/inquiry";
import { useEstimator } from "../estimator/use-estimator";
import { EstimatorCatalog } from "./EstimatorCatalog";
import { EstimatorDetails, EstimatorTextField } from "./EstimatorDetails";
import { EstimatorHosting } from "./EstimatorHosting";
import { EstimatorSummary } from "./EstimatorSummary";

export function ProjectEstimator({
  catalog: suppliedCatalog,
  contactEmail: suppliedEmail,
  disabled = false,
}: {
  catalog?: ProjectEstimatorCatalog;
  contactEmail?: string;
  disabled?: boolean;
}): React.ReactNode {
  const config = useEstimatorConfig();
  const catalog = suppliedCatalog ?? config.catalog;
  const contactEmail = suppliedEmail ?? config.contactEmail;
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const prefix = useId();
  const formId = `${prefix}-inquiry`;
  const form = useRef<HTMLFormElement>(null);
  const estimator = useEstimator(catalog);
  const { details, selection, estimate } = estimator;
  const fallback = showFallback
    ? buildEstimateSummary(details, selection, catalog)
    : "";

  function emailInquiry(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validateProjectInquiry(details, selection);
    setErrors(nextErrors);
    setStatus("");
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => {
        const target =
          form.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
          form.current?.querySelector<HTMLElement>('input[type="search"]');
        target?.focus();
      });
      return;
    }
    const normalized = projectDetailsSchema.parse({
      ...details,
      customDescription: selection.systemIds.includes("other")
        ? details.customDescription
        : "",
    });
    const summary = buildEstimateSummary(normalized, selection, catalog);
    setStatus(
      "Your email app will open a draft. Review it and send when ready, or copy your estimate below.",
    );
    window.location.href = buildContactMailto(
      `Project estimate: ${normalized.projectName}`,
      contactEmail,
      summary,
    );
  }

  async function copyEstimate(): Promise<void> {
    const summary = buildEstimateSummary(details, selection, catalog);
    try {
      await navigator.clipboard.writeText(summary);
      setShowFallback(false);
      setStatus(
        "Estimate copied. You can paste it into your email or message.",
      );
    } catch {
      setShowFallback(true);
      setStatus(
        "Clipboard access is unavailable. Select and copy the estimate below.",
      );
    }
  }

  function reset(): void {
    estimator.reset();
    setErrors({});
    setStatus("");
    setShowFallback(false);
    setResetKey((key) => key + 1);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        disabled={disabled}
        render={<Button size="lg" className="min-h-11 rounded-full px-8" />}
      >
        Start a project
      </SheetTrigger>
      <SheetContent className="gap-0 overflow-hidden data-[side=right]:w-full data-[side=right]:sm:max-w-6xl">
        <SheetHeader className="shrink-0 border-b border-border pr-16 sm:pl-6 sm:pr-16">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SheetTitle className="text-xl font-semibold">
              Start your project
            </SheetTitle>
            <p
              aria-live="polite"
              aria-atomic="true"
              className="text-sm font-semibold text-xone-violet"
              data-testid="estimate-total"
            >
              {estimate.customQuoteRequired
                ? "Estimated subtotal"
                : "Estimated total"}
              : {formatEstimatePrice(estimate.totalCents)}
              {estimate.customQuoteRequired ? " + custom quote" : ""}
            </p>
          </div>
          <SheetDescription className="mt-1 text-sm text-muted-foreground">
            Build your project brief and explore sample prices. Select systems
            and add-ons to see your estimate.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form
              ref={form}
              id={formId}
              noValidate
              onSubmit={emailInquiry}
              className="min-w-0 space-y-8"
            >
              <EstimatorDetails
                prefix={prefix}
                details={details}
                onChange={estimator.setDetails}
                errors={errors}
              />
              {errors.systems && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.systems}
                </p>
              )}
              <EstimatorCatalog
                key={resetKey}
                prefix={prefix}
                catalog={catalog}
                selection={selection}
                onSystem={estimator.selectSystem}
                onAddon={estimator.selectAddon}
              />
              {selection.systemIds.includes("other") && (
                <EstimatorTextField
                  id={`${prefix}-customDescription`}
                  label="Can’t find your system? Describe what you need."
                  value={details.customDescription}
                  maxLength={1000}
                  multiline
                  required
                  error={errors.customDescription}
                  onChange={(customDescription) =>
                    estimator.setDetails({ ...details, customDescription })
                  }
                />
              )}
              <EstimatorHosting
                prefix={prefix}
                catalog={catalog}
                selection={selection}
                onChange={estimator.patchSelection}
              />
              <EstimatorTextField
                id={`${prefix}-additionalRequirements`}
                label="Additional requirements (optional, subject to custom quote)"
                value={details.additionalRequirements}
                maxLength={1000}
                multiline
                error={errors.additionalRequirements}
                onChange={(additionalRequirements) =>
                  estimator.setDetails({ ...details, additionalRequirements })
                }
              />
            </form>
            <EstimatorSummary
              estimate={estimate}
              selection={selection}
              catalog={catalog}
              onCopy={() => void copyEstimate()}
              onReset={reset}
              status={status}
              fallback={fallback}
              formId={formId}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
