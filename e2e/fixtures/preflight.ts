import type { Page } from "@playwright/test";

/** Follow the public Skip intro action before interacting with a direct route. */
export async function dismissPreflightViaSkip(page: Page): Promise<void> {
  const skip = page.getByRole("button", { name: "Skip intro", exact: true });
  await skip.click();
  await skip.waitFor({ state: "hidden" });
}

/** Dismiss homepage preflight by clicking through the full CTA path (no env bypass). */
export async function completePreflightViaCta(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 15_000 });

  const cta = page.getByRole("button", { name: /Start Building with XONE/i });
  await cta.waitFor({ state: "visible", timeout: 25_000 });
  await cta.click();

  await page
    .getByRole("button", { name: /Starting/i })
    .waitFor({ state: "visible" })
    .catch(() => {});

  await dialog.waitFor({ state: "hidden", timeout: 10_000 });
}
