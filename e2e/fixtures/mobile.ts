import type { Locator, Page } from "@playwright/test";

import { completePreflightViaCta, dismissPreflightViaSkip } from "./preflight";

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });
  if (overflow) {
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const innerWidth = await page.evaluate(() => window.innerWidth);
    throw new Error(
      `Horizontal overflow detected: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}`,
    );
  }
}

export async function openMobileNav(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Open navigation menu/i }).click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).waitFor({
    state: "visible",
  });
}

export async function closeMobileNavViaEscape(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await page.getByRole("navigation", { name: "Mobile navigation" }).waitFor({
    state: "hidden",
  });
}

export async function assertMinTouchTarget(
  locator: Locator,
  min = 44,
): Promise<void> {
  await assertTouchTargetMinSize(locator, min);
}

export async function assertTouchTargetMinSize(
  locator: Locator,
  min = 44,
): Promise<void> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(
      "Touch target locator is not visible or has no bounding box",
    );
  }
  if (box.width < min || box.height < min) {
    throw new Error(
      `Touch target too small: ${box.width}x${box.height} (min ${min}x${min})`,
    );
  }
}

export async function visitRoute(page: Page, path: string): Promise<void> {
  await page.goto(path);
  if (path === "/") {
    await completePreflightViaCta(page);
  } else {
    await dismissPreflightViaSkip(page);
  }
  await page.waitForLoadState("domcontentloaded");
}
