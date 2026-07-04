export type ProjectCategory =
  | "web-app"
  | "mobile-app"
  | "automation"
  | "marketing-site";

export type ProjectTeamCredit = {
  name: string;
  role: string;
};

export type Project = {
  id: string;
  title: string;
  /** Short card summary */
  summary: string;
  /** Longer copy for preview cards on small screens (avoids empty shell space) */
  mobileSummary?: string;
  /** Case-study context — challenge or client situation */
  challenge: string;
  /** Measurable or qualitative results */
  outcomes: readonly string[];
  category: ProjectCategory;
  /** Xone engineer highlighted on the case study */
  leadEngineer?: string;
  /** Multi-role team credits when more than one member is featured */
  teamCredits?: readonly ProjectTeamCredit[];
  /** Optional external demo or repo URL */
  href?: string;
  /** Optional live deployment URL */
  liveHref?: string;
  /** Overrides the live link label (default: "View live site") */
  liveLinkLabel?: string;
  /** Live site screenshot shown in the portfolio card (path under `public/`) */
  previewImageSrc?: string;
  tags: readonly string[];
};

export const projectCategories: Record<ProjectCategory, string> = {
  "web-app": "Web application",
  "mobile-app": "Mobile app",
  automation: "Automation",
  "marketing-site": "Marketing site",
};

const RYAN_MAGDALITA = "Engr. Ryan Rey Magdalita";

/** Showcase projects — PM-approved case study summaries for v1 portfolio. */
export const projects: readonly Project[] = [
  {
    id: "smart-cubicle-main",
    title: "Smart restroom preventive maintenance",
    summary:
      "IoT and machine-learning platform that monitors occupancy, air quality, and supplies — then surfaces predictive maintenance on a real-time admin dashboard.",
    challenge:
      "Campus restrooms were maintained on fixed schedules with no unified sensor data. Staff could not anticipate peak usage, air-quality issues, or supply shortages before complaints.",
    outcomes: [
      "Layered sensor → Raspberry Pi → dashboard architecture with WebSocket updates",
      "ML maintenance predictions using SVM, Random Forest, and ensemble models",
      "Role-based JWT access for admins, janitors, and maintenance staff",
    ],
    category: "automation",
    leadEngineer: RYAN_MAGDALITA,
    href: "https://github.com/ryMGDLT/SMART_CUBICLE_MAIN",
    tags: [
      "Node.js",
      "Express",
      "MongoDB",
      "React",
      "Tailwind CSS",
      "Python",
      "WebSocket",
      "Machine learning",
      "Raspberry Pi",
    ],
  },
  {
    id: "esp32-controller-app",
    title: "ESP32 mobile controller app",
    summary:
      "Flutter Android app paired with ESP32 firmware to control relays and LEDs over Bluetooth or Wi-Fi, including voice commands for hands-free testing.",
    challenge:
      "Embedded coursework needed a reliable mobile-to-microcontroller workflow without manual serial debugging every session — especially when switching between lab Wi-Fi networks.",
    outcomes: [
      "Dual Bluetooth and Wi-Fi control paths with auto-detected SSID prompts",
      "Voice-driven GPIO control for four outputs (relay-ready for lighting)",
      "Matched Flutter client and Arduino firmware via customizable BLE UUIDs",
    ],
    category: "mobile-app",
    leadEngineer: RYAN_MAGDALITA,
    href: "https://github.com/ryMGDLT/ESP32_Controller_APP",
    tags: [
      "Flutter",
      "ESP32",
      "Arduino",
      "Bluetooth",
      "Wi-Fi",
      "Voice control",
    ],
  },
  {
    id: "lightbox-studio-website",
    title: "LightBox Studio website",
    summary:
      "Full-stack studio website for photography and videography — services, portfolio, gallery, and client booking flows on a Vercel-hosted Next.js app.",
    challenge:
      "The studio needed a professional public presence and reliable session booking without juggling separate tools for branding, media, and scheduling.",
    outcomes: [
      "Feature-based App Router layout (studio, scheduling, media modules)",
      "Mobile-first marketing pages with Playwright E2E layout guardrails",
      "Integration-ready stack for Calendly, MongoDB Atlas, and Cloudinary",
    ],
    category: "marketing-site",
    teamCredits: [
      {
        name: "Engr. Jhon Bert Villarosa",
        role: "Project Lead / Manager",
      },
      {
        name: "Engr. Ryan Rey Magdalita",
        role: "Senior Lead Developer (Backend & Admin)",
      },
      {
        name: "Engr. Joshua Mark Castillo",
        role: "Full Stack Developer (Frontend & API)",
      },
    ],
    liveHref: "https://www.thelightboxstudios.com/",
    previewImageSrc: "/assets/projects/lightbox-studio-preview.png",
    mobileSummary:
      "Full-stack studio website for photography and videography on Vercel. The mockup covers services, portfolio galleries, session booking, and partnerships — with a feature-based Next.js layout ready for Calendly, MongoDB, and Cloudinary integrations.",
    tags: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Zod",
      "Jest",
      "Playwright",
      "Vercel",
    ],
  },
  {
    id: "xone-software-solutions",
    title: "Xone Software Solutions",
    summary:
      "Company marketing site on Next.js App Router — portfolio showcase, services, team, and email-first lead capture deployed on Vercel.",
    challenge:
      "The legacy Vite SPA needed a separate backend for simple flows. The team wanted faster deploys, clearer SEO, and a maintainable static-first architecture.",
    outcomes: [
      "Single Next.js app on Vercel with feature-based routes and shared brand tokens",
      "Portfolio and preflight intro with Playwright mobile/tablet + desktop guard E2E",
      "Email-only contact and projects CTAs — form APIs deferred to v1.1",
    ],
    category: "marketing-site",
    teamCredits: [
      {
        name: "Engr. Jhon Bert Villarosa",
        role: "Technical Lead / Project Manager",
      },
      {
        name: "Engr. Ryan Rey Magdalita",
        role: "Software Engineer / Lead Developer",
      },
      {
        name: "Engr. Joshua Mark Castillo",
        role: "Software Engineer / Full Stack Developer",
      },
    ],
    href: "https://github.com/JshMarkCastillo-GHdev/xone-swe-next",
    liveHref: "https://xone-software-solutions.vercel.app/",
    previewImageSrc: "/assets/projects/xone-software-solutions-preview.png",
    mobileSummary:
      "Company marketing site for Xone Software Development — portfolio carousel, services, team, and email-first lead capture on Vercel. Rebuilt from a legacy Vite SPA into a static-first Next.js app with Playwright mobile and desktop E2E guardrails.",
    tags: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Zod",
      "Vitest",
      "Playwright",
      "Vercel",
    ],
  },
  {
    id: "rahamen-digital-base44",
    title: "Rahamen restaurant website",
    summary:
      "Base44 mockup for a food restaurant brand — menu highlights, story, hours, and visit or inquiry paths before a full production site.",
    challenge:
      "The restaurant needed a polished online presence to showcase the menu and location without waiting on a custom build or third-party listing limits.",
    outcomes: [
      "Clickable Base44 prototype for menu, branding, and guest-facing pages",
      "Mobile-friendly mockup for quick stakeholder and staff review",
      "Blueprint for a future ordering-ready restaurant website",
    ],
    category: "marketing-site",
    leadEngineer: "Engr. Jhon Bert Villarosa",
    liveHref: "https://rahamen.base44.app/",
    liveLinkLabel: "mockup",
    previewImageSrc: "/assets/projects/rahamen-digital-preview.png",
    mobileSummary:
      "Base44 mockup for Rahamen, a food restaurant brand. Guests can browse menu highlights, the brand story, hours, and location, then follow visit or inquiry paths — a clickable prototype before a full production ordering site.",
    tags: ["Base44", "Prototype", "Mockup"],
  },
] as const;

/** Homepage featured work — three client-facing case studies (excludes meta site entry). */
export const featuredProjects: readonly Project[] = projects
  .filter((p) => p.id !== "xone-software-solutions")
  .slice(0, 3);
