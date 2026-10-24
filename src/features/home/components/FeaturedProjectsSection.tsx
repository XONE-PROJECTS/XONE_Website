import Link from "next/link";

import {
  ProjectCard,
  ProjectsLinkButton,
} from "@/components/marketing/project-card";
import { featuredProjects } from "@/features/projects/data/projects";
import type { Project } from "@/features/projects/data/projects";

type FeaturedProjectsContent = {
  heading?: string;
  body?: string;
  projects?: readonly Project[];
};

export function FeaturedProjectsSection({ content }: { content?: FeaturedProjectsContent }) {
  const heading = content?.heading ?? "Projects that show how we deliver";
  const body = content?.body ?? "Real problems, structured builds, measurable outcomes — explore case studies similar to what you need.";
  const projects = content?.projects ?? featuredProjects;

  return (
    <section
      aria-labelledby="featured-projects-heading"
      className="border-b border-border bg-background px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl motion-safe:animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">
              Selected work
            </p>
            <h2
              id="featured-projects-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {body}
            </p>
          </div>
          <ProjectsLinkButton
            href="/projects"
            className="hidden shrink-0 sm:inline-flex"
          />
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="motion-safe:animate-fade-in-up"
              style={
                index > 0 ? { animationDelay: `${index * 80}ms` } : undefined
              }
            >
              <ProjectCard project={project} variant="compact" />
            </li>
          ))}
        </ul>

        <div className="mt-8 sm:hidden">
          <Link
            href="/projects"
            className="inline-flex text-sm font-medium text-xone-violet hover:underline"
          >
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
