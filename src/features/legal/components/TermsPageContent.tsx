import {
  LegalPageLayout,
  type LegalPageContent,
} from "@/features/legal/components/LegalPageLayout";
import { termsContent } from "@/features/legal/data/legal-content";

const defaultContent: LegalPageContent = termsContent;

export function TermsPageContent({ content }: { content?: LegalPageContent }) {
  return <LegalPageLayout {...(content ?? defaultContent)} />;
}
