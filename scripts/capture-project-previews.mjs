import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const OUTPUT_DIR = path.join("public", "assets", "projects");
const VIEWPORT = { width: 1280, height: 720 };

const TARGETS = [
  {
    id: "lightbox-studio-website",
    url: "https://www.thelightboxstudios.com/",
    file: "lightbox-studio-preview.png",
  },
  {
    id: "xone-software-solutions",
    url: "https://xone-software-solutions.vercel.app/",
    file: "xone-software-solutions-preview.png",
    completePreflight: true,
  },
  {
    id: "rahamen-digital-base44",
    url: "https://rahamen.base44.app/",
    file: "rahamen-digital-preview.png",
  },
];

async function completePreflightViaCta(page) {
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 15_000 });
  const cta = page.getByRole("button", { name: /Start Building with XONE/i });
  await cta.waitFor({ state: "visible", timeout: 25_000 });
  await cta.click();
  await dialog.waitFor({ state: "hidden", timeout: 10_000 });
}

await mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });

for (const target of TARGETS) {
  console.log(`Capturing ${target.id}…`);
  await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });

  if (target.completePreflight) {
    await completePreflightViaCta(page);
  }

  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, target.file),
    type: "png",
    animations: "disabled",
  });
  console.log(`  → ${path.join(OUTPUT_DIR, target.file)}`);
}

await browser.close();
console.log("Done.");
