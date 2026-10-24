import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serviceOfferings } from "@/features/services/data/services";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ServicePageItem = {
  id?: string;
  title: string;
  description: string;
  highlights: readonly string[];
  icon: (typeof serviceOfferings)[number]["icon"];
};

type ServicesContent = {
  heading?: string;
  body?: string;
  items?: readonly ServicePageItem[];
};

export function ServicesPageContent({
  content,
  editorBlockId,
  editing = false,
}: {
  content?: ServicesContent;
  editorBlockId?: string;
  editing?: boolean;
}) {
  const heading = content?.heading ?? "Our Services";
  const body =
    content?.body ??
    `${BRAND_NAME} delivers end-to-end digital solutions — from automation and design to production-ready web and mobile apps.`;
  const items = content?.items ?? serviceOfferings;

  return (
    <div className="bg-xone-section px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            {body}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id ?? service.title}
                {...(editorBlockId
                  ? { "data-cms-id": `${editorBlockId}-item-${index}` }
                  : {})}
                {...(editing && editorBlockId
                  ? {
                      "data-cms-item-block": editorBlockId,
                      "data-cms-item-index": index,
                    }
                  : {})}
                className="border-border bg-xone-light shadow-lg shadow-xone-navy/5"
              >
                <CardHeader>
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon className="text-2xl text-xone-violet" aria-hidden />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-xone-violet"
                          aria-hidden
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
          >
            Start a project
          </Link>
        </div>
      </div>
    </div>
  );
}
