import { z } from "zod";

const optionalWebhookUrl = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value.trim() === "") {
      return undefined;
    }
    return value.trim();
  })
  .pipe(z.url().optional());

export const envSchema = z.object({
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  CONTACT_WEBHOOK_URL: optionalWebhookUrl,
  MONGODB_URI: z.string().trim().min(1).optional(),
  MONGODB_DB_NAME: z.string().trim().min(1).default("xone_cms"),
  ADMIN_EMAIL: z.string().trim().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export type ServerEnv = z.infer<typeof envSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  return envSchema.parse(source);
}

export const env = parseServerEnv();
