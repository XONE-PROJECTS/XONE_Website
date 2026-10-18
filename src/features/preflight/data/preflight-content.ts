export const PREFLIGHT_OBJECTIVES = [
  "Build custom software with clarity and reliable delivery",
  "Design user-first products that scale with your business",
  "Partner transparently from discovery through launch",
] as const;

export const PREFLIGHT_REASONS = [
  {
    title: "Senior-led team",
    description: "work directly with the engineers who ship your product",
  },
  {
    title: "Proven delivery",
    description: "portfolio case studies with measurable outcomes",
  },
  {
    title: "Modern, maintainable stack",
    description: "TypeScript-first web and mobile builds",
  },
  {
    title: "Clear communication",
    description: "honest timelines and fast email follow-up",
  },
] as const;

export const PREFLIGHT_CTA_LABEL = "Start Building with XONE";

export type PreflightContent = {
  logoSrc: string;
  logoAlt: string;
  objectives: readonly string[];
  reasons: readonly { title: string; description: string }[];
  ctaLabel: string;
};

export const DEFAULT_PREFLIGHT_CONTENT: PreflightContent = {
  logoSrc: "/assets/XONE/xone_brand_kit/xone_logo_inverse.svg",
  logoAlt: "Xone Software Development",
  objectives: PREFLIGHT_OBJECTIVES,
  reasons: PREFLIGHT_REASONS,
  ctaLabel: PREFLIGHT_CTA_LABEL,
};

export const PREFLIGHT_TIMING = {
  logoTotalMs: 3200,
  fadeInMs: 850,
  fadeOutMs: 850,
  exitFadeMs: 900,
  backgroundFadeMs: 1000,
  objectiveItemFadeInMs: 750,
  objectiveItemFadeOutMs: 700,
  objectiveStaggerMs: 450,
  objectiveHoldMs: 1400,
  reasonHeadingFadeInMs: 700,
  reasonItemFadeInMs: 750,
  reasonStaggerMs: 450,
  reasonCtaFadeInMs: 750,
  ctaLoadingMs: 1400,
} as const;

/** Total duration of the staggered objectives sequence. */
export function getObjectivesSequenceMs(): number {
  const count = PREFLIGHT_OBJECTIVES.length;
  const fadeInPhase =
    count * PREFLIGHT_TIMING.objectiveItemFadeInMs +
    (count - 1) * PREFLIGHT_TIMING.objectiveStaggerMs;
  const fadeOutPhase =
    count * PREFLIGHT_TIMING.objectiveItemFadeOutMs +
    (count - 1) * PREFLIGHT_TIMING.objectiveStaggerMs;

  return fadeInPhase + PREFLIGHT_TIMING.objectiveHoldMs + fadeOutPhase;
}
