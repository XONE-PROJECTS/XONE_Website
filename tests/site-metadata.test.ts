import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { createPageMetadata, DEFAULT_SITE_DESCRIPTION } from "@/lib/metadata";
import { getSiteUrl, publicMarketingRoutes } from "@/lib/site";

describe("getSiteUrl", () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalVercelUrl = process.env.VERCEL_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = originalSiteUrl;
    }

    if (originalVercelUrl === undefined) {
      delete process.env.VERCEL_URL;
    } else {
      process.env.VERCEL_URL = originalVercelUrl;
    }
  });

  it("prefers SITE_URL when set", () => {
    process.env.SITE_URL = "https://example.com/";
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("falls back to VERCEL_URL when SITE_URL is unset", () => {
    delete process.env.SITE_URL;
    process.env.VERCEL_URL = "xone-swe-next.vercel.app";
    expect(getSiteUrl()).toBe("https://xone-swe-next.vercel.app");
  });

  it("uses localhost fallback in local dev", () => {
    delete process.env.SITE_URL;
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("http://localhost:5142");
  });
});

describe("publicMarketingRoutes", () => {
  it("includes primary marketing pages and excludes API routes", () => {
    expect(publicMarketingRoutes).toContain("/projects");
    expect(publicMarketingRoutes).toContain("/privacy");
    expect(publicMarketingRoutes).not.toContain("/api/health");
  });
});

describe("createPageMetadata", () => {
  beforeEach(() => {
    process.env.SITE_URL = "https://example.com";
  });

  it("returns title, description, and social metadata", () => {
    const metadata = createPageMetadata({
      title: "Projects",
      description: "Portfolio showcase",
      path: "/projects",
    });

    expect(metadata.title).toBe("Projects");
    expect(metadata.description).toBe("Portfolio showcase");
    expect(metadata.openGraph?.url).toBe("https://example.com/projects");
    expect(metadata.twitter).toMatchObject({ card: "summary" });
  });

  it("defaults description when omitted", () => {
    const metadata = createPageMetadata({ path: "/about" });
    expect(metadata.description).toBe(DEFAULT_SITE_DESCRIPTION);
  });
});
