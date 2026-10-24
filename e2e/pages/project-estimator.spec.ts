import { expect, test, type Page } from "@playwright/test";
import { assertNoHorizontalOverflow, visitRoute } from "../fixtures/mobile";

test.setTimeout(60_000);

async function openEstimator(page: Page): Promise<void> {
  await visitRoute(page, "/services");
  await page
    .getByRole("button", { name: "Start a project", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Start your project" }),
  ).toBeVisible();
}

test("finds and prices the learners module system with eligible add-ons", async ({
  page,
}) => {
  await openEstimator(page);
  await page.getByLabel("Category", { exact: true }).selectOption("operations");
  await page.getByLabel("Search systems").fill("learners");
  await page
    .getByRole("checkbox", {
      name: "Learners Module System (LMS)",
      exact: true,
    })
    .check();
  await expect(page.getByTestId("estimate-total")).toContainText("₱60,000");
  await page
    .getByRole("checkbox", {
      name: "Email/push notification integration for Learners Module System (LMS)",
      exact: true,
    })
    .check();
  await expect(page.getByTestId("estimate-total")).toContainText("₱65,000");
});

test("updates scoped upgrades, shared services, and mutually exclusive hosting", async ({
  page,
}) => {
  await openEstimator(page);
  const total = page.getByTestId("estimate-total");
  await page
    .getByRole("checkbox", { name: "Landing page", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Full CMS for Landing page", exact: true })
    .check();
  await expect(total).toContainText("₱20,000");
  await page.getByRole("checkbox", { name: "POS system", exact: true }).check();
  await page
    .getByRole("checkbox", {
      name: "Payment gateway integration for POS system",
      exact: true,
    })
    .check();
  await expect(total).toContainText("₱73,000");
  await page.getByRole("radio", { name: "Web hosting", exact: true }).check();
  await page.getByLabel("Web hosting duration").selectOption("6");
  await page.getByRole("checkbox", { name: "Domain", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "Maintenance", exact: true })
    .check();
  await page.getByLabel("Maintenance duration").selectOption("3");
  await expect(total).toContainText("₱83,200");
  await page
    .getByRole("radio", { name: "Local / On-premise", exact: true })
    .check();
  await expect(page.getByLabel("Web hosting duration")).toHaveCount(0);
  await expect(total).toContainText("₱85,200");
  await page.getByRole("radio", { name: "Not required", exact: true }).check();
  await expect(total).toContainText("₱80,200");
  await page
    .getByRole("checkbox", { name: "Landing page", exact: true })
    .uncheck();
  await expect(total).toContainText("₱60,200");
  await page
    .getByRole("checkbox", { name: "Landing page", exact: true })
    .check();
  await expect(
    page.getByRole("checkbox", {
      name: "Full CMS for Landing page",
      exact: true,
    }),
  ).not.toBeChecked();
  await expect(total).toContainText("₱72,200");
});

test("searches categories and validates custom requirements without treating them as free", async ({
  page,
}) => {
  await openEstimator(page);
  await page.getByLabel("Category", { exact: true }).selectOption("inventory");
  await page.getByLabel("Search systems").fill("procurement");
  await expect(
    page.getByRole("checkbox", {
      name: "Procurement / purchasing management",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", {
      name: "CRM / customer management",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByLabel("Search systems").fill("unlisted portal");
  await expect(
    page.getByText("No matching systems.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Can’t find your system/ }).click();
  await page
    .getByRole("checkbox", { name: "Others / Custom system", exact: true })
    .check();
  await expect(page.getByTestId("estimate-total")).toContainText(
    "Estimated subtotal",
  );
  await expect(page.getByTestId("estimate-total")).toContainText(
    "custom quote",
  );
  await page
    .getByRole("button", { name: "Email project inquiry", exact: true })
    .click();
  await expect(
    page.getByText("Describe what you need in at least 10 characters.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Project name", { exact: false })).toBeFocused();
  await page
    .getByRole("button", { name: "Reset estimate", exact: true })
    .click();
  await expect(page.getByTestId("estimate-total")).toHaveText(
    "Estimated total: ₱0",
  );
  await expect(page.getByLabel("Search systems")).toHaveValue("");
});

test("copies the full estimate and preserves selections across closing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedEstimate = text;
        },
      },
    });
  });
  await openEstimator(page);
  await page.getByLabel("Project name", { exact: false }).fill("Our wedding");
  await page
    .getByRole("checkbox", {
      name: "Wedding invitation website / web app",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Guest photo gallery for Wedding invitation website / web app",
      exact: true,
    })
    .check();
  await expect(page.getByTestId("estimate-total")).toContainText("₱23,000");
  await page
    .getByRole("button", { name: "Copy estimate", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Estimate copied");
  const copied = await page.evaluate(
    () => document.documentElement.dataset.copiedEstimate,
  );
  expect(copied).toContain("Our wedding");
  expect(copied).toContain("Guest photo gallery");
  expect(copied).toContain("₱23,000");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Start a project", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Start a project", exact: true })
    .click();
  await expect(page.getByTestId("estimate-total")).toContainText("₱23,000");
  await expect(page.getByLabel("Project name", { exact: false })).toHaveValue(
    "Our wedding",
  );
});

test("provides a selectable summary when clipboard access is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    });
  });
  await openEstimator(page);
  await page
    .getByRole("checkbox", { name: "Photobooth system", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Copy estimate", exact: true })
    .click();
  await expect(
    page.getByLabel("Select and copy your estimate", { exact: true }),
  ).toHaveValue(/Photobooth system/);
});

test("fits mobile and desktop widths, traps keyboard focus, and restores it on Escape", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openEstimator(page);
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await assertNoHorizontalOverflow(page);
    const dialog = page.getByRole("dialog", { name: "Start your project" });
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    const box = await dialog.boundingBox();
    expect(Math.round(box?.width ?? Infinity)).toBeLessThanOrEqual(width);
    if (width === 320 || width === 1280)
      await page.screenshot({
        path: testInfo.outputPath(`estimator-${width}.png`),
      });
  }
  await page.getByLabel("Project name", { exact: false }).focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((element) => element.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Start a project", exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});
