import { LegalPageLayout, type LegalPageContent } from "@/features/legal/components/LegalPageLayout";
import { privacyContent } from "@/features/legal/data/legal-content";

const defaultContent: LegalPageContent = privacyContent;

export function PrivacyPageContent({ content }: { content?: LegalPageContent }) {
  return <LegalPageLayout {...(content ?? defaultContent)} />;
}
