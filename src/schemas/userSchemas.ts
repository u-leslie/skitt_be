import { z } from "zod";
import { uuidSchema } from "../utils/uuid";

export const createUserSchema = z.object({
  user_id: uuidSchema.optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
