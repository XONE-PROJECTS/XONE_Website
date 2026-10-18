"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PREFLIGHT_CTA_LABEL,
  PREFLIGHT_REASONS,
  PREFLIGHT_TIMING,
  type PreflightContent,
} from "@/features/preflight/data/preflight-content";
import { cn } from "@/lib/utils";

const fadeTransitionClass =
  "motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-in-out";

type PreflightReasonsStepProps = {
  onDismiss: () => void;
  prefersReducedMotion?: boolean;
  content?: PreflightContent;
};

export function PreflightReasonsStep({
  onDismiss,
  prefersReducedMotion = false,
  content,
}: PreflightReasonsStepProps) {
  const reasons = content?.reasons ?? PREFLIGHT_REASONS;
  const ctaLabel = content?.ctaLabel ?? PREFLIGHT_CTA_LABEL;
  const [headingVisible, setHeadingVisible] = useState(prefersReducedMotion);
  const [reasonVisible, setReasonVisible] = useState<boolean[]>(() =>
    reasons.map(() => prefersReducedMotion),
  );
  const [ctaVisible, setCtaVisible] = useState(prefersReducedMotion);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timers: number[] = [];
    const {
      reasonHeadingFadeInMs,
      reasonItemFadeInMs,
      reasonStaggerMs,
      reasonCtaFadeInMs,
    } = PREFLIGHT_TIMING;

    timers.push(
      window.setTimeout(() => {
        setHeadingVisible(true);
      }, 0),
    );

    const reasonsStartMs = reasonHeadingFadeInMs + reasonStaggerMs;

    reasons.forEach((_, index) => {
      timers.push(
        window.setTimeout(
          () => {
            setReasonVisible((previous) => {
              const next = [...previous];
              next[index] = true;
              return next;
            });
          },
          reasonsStartMs + index * (reasonItemFadeInMs + reasonStaggerMs),
        ),
      );
    });

    const reasonsEndMs =
      reasonsStartMs +
      reasons.length * reasonItemFadeInMs +
      (reasons.length - 1) * reasonStaggerMs;

    timers.push(
      window.setTimeout(() => {
        setCtaVisible(true);
      }, reasonsEndMs + reasonCtaFadeInMs),
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [prefersReducedMotion, reasons]);

  const handleCtaClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      onDismiss();
    }, PREFLIGHT_TIMING.ctaLoadingMs);
  };

  return (
    <div
      className="flex w-full max-w-md flex-col items-center gap-8"
      aria-live="polite"
    >
      <div className="w-full space-y-5">
        <h2
          id="preflight-heading"
          className={cn(
            "text-center text-xs font-semibold uppercase tracking-[0.2em] text-xone-cyan",
            fadeTransitionClass,
            headingVisible ? "opacity-100" : "opacity-0",
          )}
        >
          Why XONE
        </h2>
        <ul className="space-y-4">
          {reasons.map((reason, index) => (
            <li
              key={reason.title}
              className={cn(
                "border-l-2 border-xone-violet/60 pl-4 text-sm leading-relaxed sm:text-base",
                fadeTransitionClass,
                reasonVisible[index] ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="font-semibold text-white">{reason.title}</span>
              <span className="text-xone-light/85">
                {" "}
                — {reason.description}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={!ctaVisible || isLoading}
        aria-busy={isLoading}
        onClick={handleCtaClick}
        className={cn(
          "w-full bg-xone-violet text-white hover:bg-xone-violet/90 sm:w-auto",
          fadeTransitionClass,
          ctaVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {isLoading ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              aria-hidden
              data-icon="inline-start"
            />
            Starting…
          </>
        ) : (
          ctaLabel
        )}
      </Button>
    </div>
  );
}
