import Link from "next/link";

import { buildContactMailto, CONTACT_EMAIL } from "@/lib/brand";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  listItems?: readonly string[];
};

export type LegalPageContent = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: readonly LegalSection[];
};

export function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalPageContent) {
  return (
    <article className="bg-xone-section px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </header>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.listItems ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
          <p>
            Questions about this page?{" "}
            <Link
              href="/contact"
              className="font-medium text-xone-violet hover:underline"
            >
              Contact us
            </Link>{" "}
            or email{" "}
            <a
              href={buildContactMailto("Legal inquiry")}
              className="font-medium text-xone-violet hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <p className="mt-3 text-xs">
            This document is provided for general information and does not
            constitute legal advice. A formal legal review may follow before
            production launch.
          </p>
        </footer>
      </div>
    </article>
  );
}
