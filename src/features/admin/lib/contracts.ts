import { z } from "zod";
export const revisionSchema = z.number().int().min(0);
export const saveRequestSchema = z.object({ content: z.unknown(), revision: revisionSchema, manual: z.boolean().default(false) }).strict();
export const publishRequestSchema = z.object({ revision: revisionSchema }).strict();
export const restoreRequestSchema = z.object({ revision: revisionSchema, id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/) }).strict();
