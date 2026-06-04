import { z } from "zod";

import { normalizeUsername } from "@/lib/auth/login-schema";
import { APP_ROLES } from "@/lib/auth/permissions";

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;
const INVALID_USER_MESSAGE = "Thong tin nguoi dung khong hop le.";

const activeStateSchema = z.preprocess((value) => {
  if (value === true || value === "true" || value === "on") return true;
  if (value === false || value === "false" || value === null) return false;
  return value;
}, z.boolean());

const displayNameSchema = z.string().trim().min(1).max(120);

const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .refine((value) => USERNAME_PATTERN.test(value));

const createUserSchema = z.object({
  displayName: displayNameSchema,
  username: usernameSchema,
  email: z.string().trim().toLowerCase().email(),
  temporaryPassword: z.string().min(6).max(128),
  role: z.enum(APP_ROLES),
  isActive: activeStateSchema,
});

const updateUserSchema = z.object({
  userId: z.uuid(),
  membershipId: z.uuid(),
  displayName: displayNameSchema,
  username: usernameSchema,
  role: z.enum(APP_ROLES),
  isActive: activeStateSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export function parseCreateUserInput(input: unknown): CreateUserInput {
  const result = createUserSchema.safeParse(input);

  if (!result.success) {
    throw new Error(INVALID_USER_MESSAGE);
  }

  return result.data;
}

export function parseUpdateUserInput(input: unknown): UpdateUserInput {
  const result = updateUserSchema.safeParse(input);

  if (!result.success) {
    throw new Error(INVALID_USER_MESSAGE);
  }

  return result.data;
}
