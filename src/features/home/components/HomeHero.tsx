import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_NAME, buildContactMailto } from "@/lib/brand";

type HomeHeroContent = {
  eyebrow?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HomeHero({ content }: { content?: HomeHeroContent }) {
  const eyebrow = content?.eyebrow ?? BRAND_NAME;
  const heading =
    content?.heading ??
    "Custom software for teams that need clarity and reliable delivery";
  const body =
    content?.body ??
    "We design and build web apps, mobile experiences, and automation — with a direct line to the engineers who ship your product.";
  const ctaLabel = content?.ctaLabel ?? "View our projects";
  const ctaHref = content?.ctaHref ?? "/projects";

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="border-b border-border bg-background px-4 py-14 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-3xl motion-safe:animate-fade-in-up">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">
          {eyebrow}
        </p>
        <h1
          id="home-hero-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-tight"
        >
          {heading}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {body}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full sm:w-auto",
            )}
          >
            {ctaLabel}
          </Link>
          <a
            href={buildContactMailto("Project inquiry")}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-h-11 w-full sm:w-auto",
            )}
          >
            Email us
          </a>
        </div>
      </div>
    </section>
  );
}
