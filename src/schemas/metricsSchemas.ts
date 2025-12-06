import { z } from "zod";
import { uuidSchema } from "../utils/uuid";

export const createFlagEventSchema = z.object({
  flag_id: uuidSchema,
  user_id: uuidSchema.optional(),
  event_type: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export type CreateFlagEventInput = z.infer<typeof createFlagEventSchema>;
