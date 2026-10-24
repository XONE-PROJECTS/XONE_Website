import { buildContactMailto } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type HomeCtaContent = {
  heading?: string;
  body?: string;
  label?: string;
  href?: string;
};

export function HomeCtaSection({ content }: { content?: HomeCtaContent }) {
  const heading = content?.heading ?? "Ready to talk about your project?";
  const body = content?.body ?? "Tell us what you are building. We respond within one business day to schedule a discovery conversation.";
  const label = content?.label ?? "Email us";
  const href = content?.href ?? buildContactMailto("Project inquiry");

  return (
    <section
      aria-labelledby="home-cta-heading"
      className="bg-background px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="home-cta-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {heading}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {body}
        </p>
        {href.startsWith("/") ? (
          <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex w-full sm:w-auto")}>{label}</Link>
        ) : (
          <a href={href} className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex w-full sm:w-auto")}>{label}</a>
        )}
      </div>
    </section>
  );
}
