import type { Metadata } from "next";

import { ContactPageContent } from "@/features/contact/components/ContactPageContent";
import { createPageMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: `Contact ${BRAND_NAME} by email to discuss your software project.`,
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageContent />;
}
