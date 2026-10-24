import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { processSteps } from "@/features/process/data/process-steps";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ProcessPageItem = {
  step: number;
  title: string;
  summary: string;
  details: readonly string[];
};

type ProcessContent = {
  heading?: string;
  body?: string;
  items?: readonly ProcessPageItem[];
};

export function ProcessPageContent({ content }: { content?: ProcessContent }) {
  const heading = content?.heading ?? "How We Work";
  const body =
    content?.body ??
    `${BRAND_NAME} follows a proven five-step process to deliver successful projects — from discovery through long-term support.`;
  const items = content?.items ?? processSteps;

  return (
    <div className="bg-xone-section px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            {body}
          </p>
        </header>

        <div className="space-y-6">
          {items.map((step) => (
            <Card key={step.step} className="border-border bg-xone-light">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-xone-accent-muted text-lg font-bold text-xone-violet">
                  {step.step}
                </div>
                <div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {step.summary}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-xone-violet"
                        aria-hidden
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
          >
            Start your project
          </Link>
        </div>
      </div>
    </div>
  );
}
