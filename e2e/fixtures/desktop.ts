import { expect, type Page } from "@playwright/test";

import { completePreflightViaCta, dismissPreflightViaSkip } from "./preflight";

export async function assertDesktopNav(page: Page): Promise<void> {
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Open navigation menu/i }),
  ).toBeHidden();
}

export async function assertMobileNavHidden(page: Page): Promise<void> {
  await expect(
    page.getByRole("button", { name: /Open navigation menu/i }),
  ).toBeHidden();
}

export async function assertGridColumnCount(
  page: Page,
  selector: string,
  minCols: number,
): Promise<void> {
  const columnCount = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const template = window.getComputedStyle(el).gridTemplateColumns;
      return template.split(" ").filter(Boolean).length;
    });

  if (columnCount < minCols) {
    throw new Error(
      `Expected at least ${minCols} grid columns for "${selector}", got ${columnCount}`,
    );
  }
}

export async function assertElementMinHeight(
  page: Page,
  selector: string,
  minPx: number,
): Promise<void> {
  const height = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      return el.getBoundingClientRect().height;
    });

  if (height < minPx) {
    throw new Error(
      `Expected "${selector}" height >= ${minPx}px, got ${height}px`,
    );
  }
}

export async function assertMinFontSize(
  page: Page,
  selector: string,
  minPx: number,
): Promise<void> {
  const fontSize = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      return Number.parseFloat(window.getComputedStyle(el).fontSize);
    });

  if (fontSize < minPx) {
    throw new Error(
      `Expected "${selector}" font-size >= ${minPx}px, got ${fontSize}px`,
    );
  }
}

export async function assertFlexDirection(
  page: Page,
  selector: string,
  expectedRow: boolean,
): Promise<void> {
  const flexDirection = await page.locator(selector).evaluate((el) => {
    return window.getComputedStyle(el).flexDirection;
  });
  const isRow = flexDirection === "row" || flexDirection === "row-reverse";
  if (isRow !== expectedRow) {
    throw new Error(
      `Expected flex-direction ${expectedRow ? "row" : "column"}, got ${flexDirection}`,
    );
  }
}

export async function visitHomeWithPreflight(page: Page): Promise<void> {
  await page.goto("/");
  await completePreflightViaCta(page);
  await page.waitForLoadState("domcontentloaded");
}

export async function visitRouteDesktop(
  page: Page,
  path: string,
): Promise<void> {
  if (path === "/") {
    await visitHomeWithPreflight(page);
    return;
  }

  await page.goto(path);
  await page.waitForLoadState("domcontentloaded");
  await dismissPreflightViaSkip(page);
}
