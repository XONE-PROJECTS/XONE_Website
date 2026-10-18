import { FeaturedProjectsSection } from "@/features/home/components/FeaturedProjectsSection";
import { HomeCtaSection } from "@/features/home/components/HomeCtaSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { TeamStripSection } from "@/features/home/components/TeamStripSection";
import { ServicesPageContent } from "@/features/services/components/ServicesPageContent";
import { AboutPageContent } from "@/features/about/components/AboutPageContent";
import { ProcessPageContent } from "@/features/process/components/ProcessPageContent";
import { ProjectsPageContent } from "@/features/projects/components/ProjectsPageContent";
import { ContactPageContent } from "@/features/contact/components/ContactPageContent";
import { PrivacyPageContent } from "@/features/legal/components/PrivacyPageContent";
import { TermsPageContent } from "@/features/legal/components/TermsPageContent";
import type { PageKey } from "@/features/admin/lib/content";

export function RestoredPublicPage({ page }: { page: PageKey }): ReactNode {
  switch (page) {
    case "home":
      return (
        <>
          <HomeHero />
          <FeaturedProjectsSection />
          <TeamStripSection />
          <HomeCtaSection />
        </>
      );
    case "services":
      return <ServicesPageContent />;
    case "about":
      return <AboutPageContent />;
    case "process":
      return <ProcessPageContent />;
    case "projects":
      return <ProjectsPageContent />;
    case "contact":
      return <ContactPageContent />;
    case "privacy":
      return <PrivacyPageContent />;
    case "terms":
      return <TermsPageContent />;
    case "footer":
      return null;
  }
}
import type { ReactNode } from "react";

