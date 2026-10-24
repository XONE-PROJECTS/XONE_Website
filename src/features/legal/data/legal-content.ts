import { BRAND_NAME, CONTACT_EMAIL } from "@/lib/brand";
import type { LegalPageContent } from "@/features/legal/components/LegalPageLayout";

export const privacyContent: LegalPageContent = {
  title: "Privacy Policy",
  lastUpdated: "June 14, 2026",
  intro: `${BRAND_NAME} ("Xone," "we," "us") respects your privacy. This policy describes what information we collect when you visit our website, how we use it, and the choices available to you. Our v1 marketing site does not offer user accounts or online contact forms; lead capture is email-only via your mail client.`,
  sections: [
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: [
        "We collect limited information automatically when you browse our public pages, such as IP address, browser type, device type, referring URL, and pages viewed. If you email us, we receive the contents of your message and any contact details you choose to include.",
      ],
      listItems: [
        "Server and analytics logs (standard web hosting telemetry)",
        "Information you voluntarily send by email or phone",
        "Cookie or local storage data only where required for basic site functionality",
      ],
    },
    {
      id: "how-we-use-information",
      title: "How we use information",
      paragraphs: [
        "We use collected information to operate and improve the website, respond to inquiries, understand aggregate traffic patterns, and protect against abuse or security incidents. We do not sell personal information.",
      ],
      listItems: [
        "Respond to project inquiries and schedule discovery calls",
        "Maintain site security, uptime, and performance",
        "Comply with applicable legal obligations",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      paragraphs: [
        "Our marketing site is primarily static. We may use essential cookies required by our hosting provider or analytics tools configured at deploy time. You can control cookies through your browser settings; disabling cookies may affect limited features.",
      ],
    },
    {
      id: "sharing",
      title: "When we share information",
      paragraphs: [
        "We share information only with service providers that help us host and operate the site (for example, Vercel), when required by law, or to protect our rights and users. Providers are bound by contractual obligations to handle data appropriately.",
      ],
    },
    {
      id: "retention",
      title: "Data retention",
      paragraphs: [
        "Server logs are retained for a limited period consistent with hosting defaults and security needs. Email correspondence is retained as long as needed to manage the business relationship or as required for record-keeping.",
      ],
    },
    {
      id: "your-rights",
      title: "Your choices and rights",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, or restrict certain processing of personal information. Because we do not operate user accounts on this site, most requests relate to email correspondence or analytics data tied to your visit.",
        `To exercise privacy rights or ask questions, contact us at ${CONTACT_EMAIL}. We will respond within a reasonable timeframe.`,
      ],
    },
    {
      id: "children",
      title: "Children's privacy",
      paragraphs: [
        "Our services are directed to businesses and professionals. We do not knowingly collect personal information from children under 13. If you believe a child has provided us information, contact us so we can delete it.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        'We may update this Privacy Policy to reflect product, legal, or operational changes. The "Last updated" date at the top will change when we publish revisions. Continued use of the site after updates constitutes acceptance of the revised policy.',
      ],
    },
  ],
};

export const termsContent: LegalPageContent = {
  title: "Terms of Service",
  lastUpdated: "June 14, 2026",
  intro: `These Terms of Service ("Terms") govern your access to and use of the ${BRAND_NAME} marketing website. By using this site, you agree to these Terms. If you do not agree, please do not use the site. Custom software engagements are governed by separate written agreements signed with clients.`,
  sections: [
    {
      id: "use-of-site",
      title: "Use of the website",
      paragraphs: [
        "You may use this site for lawful purposes only. You agree not to interfere with site operation, attempt unauthorized access, scrape content in violation of applicable law, or use the site to transmit malware or abusive content.",
      ],
    },
    {
      id: "services",
      title: "Marketing content vs. professional services",
      paragraphs: [
        "Information on this site describes our capabilities, process, and sample work. It is informational and does not constitute a binding offer. Project scope, timelines, fees, and deliverables are defined only in a mutually executed statement of work or contract.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "Unless otherwise noted, Xone owns the text, design, logos, and other materials on this site. You may view and share links to our pages for personal or business reference. You may not copy, modify, distribute, or create derivative works from site content without our prior written consent.",
        "Client project deliverables and ownership terms are addressed in individual client agreements, not in these Terms.",
      ],
    },
    {
      id: "third-party-links",
      title: "Third-party links",
      paragraphs: [
        "Our site may link to external websites or portfolio demos. We are not responsible for the content, privacy practices, or availability of third-party sites. Accessing external links is at your own risk.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        'This site and its content are provided "as is" and "as available" without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the site will be uninterrupted or error-free.',
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, Xone and its team members will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this site. Our total liability for claims related to the site is limited to one hundred U.S. dollars (USD $100) or the minimum amount permitted by law, whichever is greater.",
      ],
    },
    {
      id: "indemnity",
      title: "Indemnification",
      paragraphs: [
        "You agree to indemnify and hold harmless Xone from claims arising out of your misuse of the site or violation of these Terms, to the extent permitted by applicable law.",
      ],
    },
    {
      id: "governing-law",
      title: "Governing law",
      paragraphs: [
        "These Terms are governed by the laws of the United States and the state in which Xone primarily operates, without regard to conflict-of-law principles. Disputes will be resolved in the courts of that jurisdiction, unless otherwise required by mandatory local law.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      paragraphs: [
        'We may revise these Terms from time to time. Material changes will be reflected by updating the "Last updated" date. Your continued use of the site after changes become effective constitutes acceptance of the revised Terms.',
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        `Questions about these Terms may be sent to ${CONTACT_EMAIL} or via our Contact page.`,
      ],
    },
  ],
};
