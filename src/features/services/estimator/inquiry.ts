import { z } from "zod";
import { BRAND_NAME } from "@/lib/brand";
import { formatEstimatePrice, type ProjectEstimatorCatalog } from "./catalog";
import {
  calculateEstimate,
  normalizeSelection,
  type EstimatorSelection,
} from "./pricing";

export const timelineOptions = [
  "As soon as possible",
  "1–3 months",
  "3–6 months",
  "Flexible",
] as const;

function safeText(value: string): boolean {
  return (
    ![...value].some((character) => {
      const point = character.codePointAt(0) ?? 0;
      return (
        (point < 32 && point !== 10 && point !== 13 && point !== 9) ||
        (point >= 127 && point <= 159) ||
        (point >= 0x200b && point <= 0x200f) ||
        (point >= 0x202a && point <= 0x202e) ||
        (point >= 0x2060 && point <= 0x206f) ||
        point === 0xfeff
      );
    }) && !/[<>]/u.test(value)
  );
}

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      safeText,
      "Use plain text without hidden control characters or HTML.",
    );
export const projectDetailsSchema = z.object({
  projectName: text(100).pipe(z.string().min(1, "Enter a project name.")),
  description: text(2000).pipe(
    z.string().min(10, "Describe your project in at least 10 characters."),
  ),
  timeline: z.enum(timelineOptions),
  name: text(100).pipe(z.string().min(1, "Enter your name.")),
  email: text(254)
    .pipe(z.email("Enter a valid email address."))
    .transform((value) => value.toLowerCase()),
  company: text(100),
  customDescription: text(1000),
  additionalRequirements: text(1000),
});
export type ProjectDetails = z.input<typeof projectDetailsSchema>;
export type InquiryErrors = Partial<
  Record<keyof ProjectDetails | "systems", string>
>;

export function createProjectDetails(): ProjectDetails {
  return {
    projectName: "",
    description: "",
    timeline: "Flexible",
    name: "",
    email: "",
    company: "",
    customDescription: "",
    additionalRequirements: "",
  };
}

export function validateProjectInquiry(
  details: ProjectDetails,
  selection: EstimatorSelection,
): InquiryErrors {
  const result = projectDetailsSchema.safeParse({
    ...details,
    customDescription: selection.systemIds.includes("other")
      ? details.customDescription
      : "",
  });
  const errors: InquiryErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (
        typeof field === "string" &&
        field in details &&
        !errors[field as keyof ProjectDetails]
      )
        errors[field as keyof ProjectDetails] = issue.message;
    }
  }
  if (!selection.systemIds.length)
    errors.systems = "Select at least one system or Others / Custom system.";
  if (
    selection.systemIds.includes("other") &&
    details.customDescription.trim().length < 10
  )
    errors.customDescription =
      "Describe what you need in at least 10 characters.";
  return errors;
}

export function buildEstimateSummary(
  details: ProjectDetails,
  selection: EstimatorSelection,
  catalog: ProjectEstimatorCatalog,
): string {
  const selected = normalizeSelection(selection, catalog);
  const estimate = calculateEstimate(selected, catalog);
  const lines = [
    `${BRAND_NAME} — Project estimate`,
    "Sample PHP estimate. Final scope and pricing require confirmation.",
    "",
    `Project: ${details.projectName.trim() || "Not provided"}`,
    `Name: ${details.name.trim() || "Not provided"}`,
    `Email: ${details.email.trim().toLowerCase() || "Not provided"}`,
    `Company: ${details.company.trim() || "Not provided"}`,
    `Preferred timeline: ${details.timeline}`,
    `Project details: ${details.description.trim() || "Not provided"}`,
    "",
    "Selected systems:",
    ...selected.systemIds.map(
      (id) =>
        `- ${catalog.systems.find((item) => item.id === id)?.label ?? id}`,
    ),
    "",
    "Itemized estimate:",
    ...estimate.lines.map(
      (line) =>
        `- ${line.label}: ${formatEstimatePrice(line.totalCents)} (${line.term}${line.quantity > 1 ? `; ${formatEstimatePrice(line.unitPriceCents)}/month` : ""})`,
    ),
    `Hosting choice: ${selected.hosting === "local" ? "Local / On-premise — customer's own PC/server and office network" : selected.hosting === "web" ? `Web hosting — ${selected.hostingMonths} month(s)` : "Not required"}`,
    `${estimate.customQuoteRequired ? "Estimated subtotal" : "Estimated total"}: ${formatEstimatePrice(estimate.totalCents)}`,
  ];
  if (estimate.customQuoteRequired)
    lines.push(
      `Custom quote required: ${details.customDescription.trim() || "Please describe what you need."}`,
    );
  if (details.additionalRequirements.trim())
    lines.push(
      `Additional requirements (subject to custom quote): ${details.additionalRequirements.trim()}`,
    );
  lines.push(
    "",
    "Hardware, remote-access arrangements, external subscriptions, domain renewal, transaction fees and usage charges require separate confirmation. No automatic renewal or payment is requested.",
  );
  return lines.join("\n");
}
