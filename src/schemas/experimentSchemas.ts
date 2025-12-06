import { z } from "zod";
import { uuidSchema } from "../utils/uuid";

export const createExperimentSchema = z.object({
  flag_id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  variant_a_percentage: z.number().int().min(0).max(100).optional(),
  variant_b_percentage: z.number().int().min(0).max(100).optional(),
  status: z.enum(["draft", "running", "paused", "completed"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const updateExperimentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  variant_a_percentage: z.number().int().min(0).max(100).optional(),
  variant_b_percentage: z.number().int().min(0).max(100).optional(),
  status: z.enum(["draft", "running", "paused", "completed"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type CreateExperimentInput = z.infer<typeof createExperimentSchema>;
export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>;
