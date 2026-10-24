import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_NAME, BRAND_SHORT, brandAssets } from "@/lib/brand";
import { cn } from "@/lib/utils";

const values = [
  {
    title: "User-first design",
    description:
      "Every product decision starts with the people who will use it — clarity, accessibility, and delight.",
  },
  {
    title: "Scalable engineering",
    description:
      "We build with TypeScript, modern frameworks, and patterns that grow with your business.",
  },
  {
    title: "Transparent partnership",
    description:
      "Regular demos, honest timelines, and collaborative communication from kickoff to launch.",
  },
] as const;

export type AboutValue = { title: string; description: string };
export type AboutContent = {
  heading?: string;
  intro?: string;
  logoSrc?: string;
  logoAlt?: string;
  storyHeading?: string;
  storyParagraphs?: readonly string[];
  values?: readonly AboutValue[];
  ctaHeading?: string;
  ctaBody?: string;
  processLabel?: string;
  contactLabel?: string;
};

export function AboutPageContent({ content }: { content?: AboutContent }) {
  const heading = content?.heading ?? `About ${BRAND_SHORT}`;
  const intro =
    content?.intro ??
    `${BRAND_NAME} is a forward-thinking software studio focused on system generation, UI/UX design, and web and mobile application development.`;
  const logoSrc = content?.logoSrc ?? brandAssets.logo;
  const logoAlt = content?.logoAlt ?? BRAND_NAME;
  const storyHeading = content?.storyHeading ?? "Our story";
  const storyParagraphs = content?.storyParagraphs ?? [
    `We started ${BRAND_SHORT} with a simple belief: technology should be powerful, accessible, and designed with real users in mind. Too many businesses struggle with fragmented tools, outdated interfaces, and systems that do not scale.`,
    "Our team bridges that gap — combining product thinking, design craft, and engineering discipline to deliver digital solutions that make work easier and growth sustainable.",
  ];
  const aboutValues = content?.values ?? values;
  const ctaHeading = content?.ctaHeading ?? "Ready to work together?";
  const ctaBody =
    content?.ctaBody ??
    "Learn how we plan, build, and deliver — or reach out to discuss your next project.";
  const processLabel = content?.processLabel ?? "See our process";
  const contactLabel = content?.contactLabel ?? "Contact us";

  return (
    <div className="bg-xone-section px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <Image
            src={logoSrc}
            alt={logoAlt}
            className="mx-auto mb-6 h-12 w-auto"
            width={200}
            height={48}
          />
          <h1 className="text-3xl font-bold text-foreground sm:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            {intro}
          </p>
        </header>

        <section className="mb-12 rounded-2xl bg-xone-card p-6 shadow-sm sm:p-10">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            {storyHeading}
          </h2>
          {storyParagraphs.map((paragraph, index) => (
            <p
              key={`${paragraph}-${index}`}
              className={
                index === 0
                  ? "mb-4 leading-relaxed text-muted-foreground"
                  : "leading-relaxed text-muted-foreground"
              }
            >
              {paragraph}
            </p>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {aboutValues.map((value) => (
              <Card key={value.title} className="bg-xone-light">
                <CardHeader>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-xone-accent-muted p-6 text-center sm:p-10">
          <h2 className="mb-3 text-2xl font-semibold text-foreground">
            {ctaHeading}
          </h2>
          <p className="mb-6 text-muted-foreground">{ctaBody}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/process"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              {processLabel}
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {contactLabel}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
