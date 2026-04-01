import { z } from "zod/v4";

// -- Request schemas --

export const registerRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// -- Response schemas --

export const registerResponseSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  verificationRequired: z.boolean(),
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

// Add your domain schemas below. Always derive types with z.infer<>.
