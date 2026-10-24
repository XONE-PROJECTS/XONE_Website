import Link from "next/link";
import { Mail } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildContactMailto, BRAND_NAME, CONTACT_EMAIL } from "@/lib/brand";
import { ProjectsCarousel } from "@/features/projects/components/ProjectsCarousel";
import { projects, type Project } from "@/features/projects/data/projects";

type ProjectsContent = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  emailLabel?: string;
  emailHref?: string;
  projects?: readonly Project[];
  asideHeading?: string;
  asideBody?: string;
  asidePrimaryLabel?: string;
  asidePrimaryHref?: string;
  asideSecondaryLabel?: string;
  asideSecondaryHref?: string;
};

export function ProjectsPageContent({ content }: { content?: ProjectsContent }) {
  const eyebrow = content?.eyebrow ?? "Portfolio";
  const heading = content?.heading ?? "Our projects";
  const body = content?.body ?? `Case studies from ${BRAND_NAME}. Swipe or use the dots to browse — the center card is in focus. Email us if something matches your needs.`;
  const emailLabel = content?.emailLabel ?? `Email ${CONTACT_EMAIL}`;
  const emailHref = content?.emailHref ?? buildContactMailto("Project inquiry from portfolio");
  const items = content?.projects ?? projects;
  const asideHeading = content?.asideHeading ?? "Have a project in mind?";
  const asideBody = content?.asideBody ?? "Tell us about your goals by email. We will follow up to schedule a discovery call.";
  const asidePrimaryLabel = content?.asidePrimaryLabel ?? "Send us an email";
  const asidePrimaryHref = content?.asidePrimaryHref ?? buildContactMailto();
  const asideSecondaryLabel = content?.asideSecondaryLabel ?? "Contact details";
  const asideSecondaryHref = content?.asideSecondaryHref ?? "/contact";

  return (
    <div className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {body}
          </p>
          <a
            href={emailHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 inline-flex gap-2",
            )}
          >
            <Mail className="size-4" aria-hidden />
            {emailLabel}
          </a>
        </header>
      </div>

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
          <ProjectsCarousel items={items} />
      </div>

      <div className="mx-auto max-w-6xl">
        <aside className="mt-12 border-t border-border pt-10 text-center sm:text-left">
          <h2 className="text-xl font-semibold text-foreground">
            {asideHeading}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:mx-0">
            {asideBody}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-start">
            <a
              href={asidePrimaryHref}
              className={buttonVariants({ size: "lg" })}
            >
              {asidePrimaryLabel}
            </a>
            <Link
              href={asideSecondaryHref}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {asideSecondaryLabel}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
