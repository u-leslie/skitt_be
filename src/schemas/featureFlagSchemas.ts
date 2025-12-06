import { z } from "zod";

export const createFeatureFlagSchema = z.object({
  key: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const updateFeatureFlagSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;

