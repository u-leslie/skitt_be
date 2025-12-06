import { z } from "zod";

// UUID validation regex (matches standard UUID format)
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z.string().uuid("Invalid UUID format");

export function isValidUUID(value: string): boolean {
  return uuidRegex.test(value);
}

export function validateUUID(value: string, fieldName: string = "ID"): void {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid ${fieldName}: must be a valid UUID`);
  }
}
