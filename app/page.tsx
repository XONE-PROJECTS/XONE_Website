import type { Metadata } from "next";

import { FeaturedProjectsSection } from "@/features/home/components/FeaturedProjectsSection";
import { HomeCtaSection } from "@/features/home/components/HomeCtaSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { TeamStripSection } from "@/features/home/components/TeamStripSection";
import { PreFlightIntro } from "@/features/preflight/components/PreFlightIntro";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  path: "",
});

export default function HomePage() {
  return (
    <>
      <PreFlightIntro />
      <HomeHero />
      <FeaturedProjectsSection />
      <TeamStripSection />
      <HomeCtaSection />
    </>
  );
}
