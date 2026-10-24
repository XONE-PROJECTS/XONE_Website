import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 5142);
const baseURL = `http://127.0.0.1:${PORT}`;

const desktopGuardSpec = /desktop-guard\.spec\.ts/;

const chromiumOnly = { browserName: "chromium" as const };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      SITE_URL: baseURL,
      CI: "true",
    },
  },
  projects: [
    {
      name: "iphone-xs-max",
      use: {
        ...devices["iPhone 13 Pro Max"],
        ...chromiumOnly,
        viewport: { width: 414, height: 896 },
        isMobile: true,
        hasTouch: true,
      },
      testIgnore: desktopGuardSpec,
    },
    {
      name: "ipad-pro-11",
      use: { ...devices["iPad Pro 11"], ...chromiumOnly },
      testIgnore: desktopGuardSpec,
    },
    {
      name: "galaxy-tab-s4",
      use: { ...devices["Galaxy Tab S4"], ...chromiumOnly },
      testIgnore: desktopGuardSpec,
    },
    {
      name: "pixel-7",
      use: { ...devices["Pixel 7"], ...chromiumOnly },
      testIgnore: desktopGuardSpec,
    },
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        ...chromiumOnly,
        viewport: { width: 1280, height: 720 },
      },
      testMatch: [desktopGuardSpec, /project-estimator\.spec\.ts/],
    },
  ],
});
