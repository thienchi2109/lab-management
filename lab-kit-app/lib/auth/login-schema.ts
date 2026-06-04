import { z } from "zod";

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export const loginSchema = z.object({
  username: z
    .string()
    .transform(normalizeUsername)
    .refine((value) => USERNAME_PATTERN.test(value), {
      message: "Tên đăng nhập không hợp lệ.",
    }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export function parseLoginCredentials(input: unknown): LoginCredentials {
  return loginSchema.parse(input);
}
