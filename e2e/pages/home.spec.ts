import { expect, test } from "@playwright/test";

import { openMobileNav, visitRoute } from "../fixtures/mobile";

test("hero and featured projects visible after preflight", async ({ page }) => {
  await visitRoute(page, "/");

  await expect(
    page.getByRole("heading", {
      name: /Custom software for teams that need clarity/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: /Projects that show how we deliver/i,
    }),
  ).toBeVisible();

  const featuredGrid = page.locator(
    'section[aria-labelledby="featured-projects-heading"] ul.grid',
  );
  await expect(featuredGrid.locator(":scope > li")).toHaveCount(3);
});

test("preflight stays dismissed during client navigation", async ({ page }) => {
  await visitRoute(page, "/");

  await openMobileNav(page);
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Projects", exact: true })
    .click();
  await page.waitForURL("**/projects");
  await openMobileNav(page);
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await page.waitForURL("**/");

  await expect(page.getByRole("dialog")).toBeHidden();

  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
});
