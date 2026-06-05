import { z } from "zod";

export const KIT_STATUSES = [
  "in_stock",
  "assigned",
  "used",
  "void",
  "expired",
  "lost",
] as const;

export type KitStatus = (typeof KIT_STATUSES)[number];

const INVALID_KIT_MESSAGE = "Thông tin kho KIT không hợp lệ.";
const CODE_PATTERN = /^[A-Z0-9_-]{2,64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const activeStateSchema = z.preprocess((value) => {
  if (value === true || value === "true" || value === "on") return true;
  if (value === false || value === "false" || value === null) return false;
  return value;
}, z.boolean());

const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => CODE_PATTERN.test(value));

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .optional()
  .nullable();

const dateStringSchema = z
  .string()
  .trim()
  .refine((value) => DATE_PATTERN.test(value));

const kitTypeSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(1).max(160),
  manufacturer: optionalTextSchema,
  isActive: activeStateSchema,
});

const batchSchema = z
  .object({
    kitTypeId: z.uuid(),
    lotNumber: codeSchema,
    receivedQuantity: z.coerce.number().int().min(0).max(100000),
    remainingQuantity: z.coerce.number().int().min(0).max(100000),
    expiresOn: dateStringSchema.nullable().optional(),
    receivedAt: dateStringSchema,
  })
  .refine((input) => input.remainingQuantity <= input.receivedQuantity);

const kitUnitSchema = z
  .object({
    batchId: z.uuid(),
    kitCodes: z.array(codeSchema).min(1).max(500),
  })
  .transform((input) => ({
    batchId: input.batchId,
    kitCodes: Array.from(new Set(input.kitCodes)),
  }));

const kitStatusSchema = z
  .object({
    kitId: z.uuid(),
    status: z.enum(KIT_STATUSES),
    reason: z.string().trim(),
  })
  .refine((input) => {
    if (["void", "expired", "lost"].includes(input.status)) {
      return input.reason.length > 0;
    }

    return true;
  });

export type KitTypeInput = z.infer<typeof kitTypeSchema>;
export type KitBatchInput = z.infer<typeof batchSchema>;
export type KitUnitInput = z.infer<typeof kitUnitSchema>;
export type KitStatusInput = z.infer<typeof kitStatusSchema>;

export function parseKitTypeInput(input: unknown): KitTypeInput {
  return parseWithMessage(kitTypeSchema, input);
}

export function parseBatchInput(input: unknown): KitBatchInput {
  return parseWithMessage(batchSchema, input);
}

export function parseKitUnitInput(input: unknown): KitUnitInput {
  return parseWithMessage(kitUnitSchema, input);
}

export function parseKitStatusInput(input: unknown): KitStatusInput {
  return parseWithMessage(kitStatusSchema, input);
}

function parseWithMessage<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new Error(INVALID_KIT_MESSAGE);
  }

  return result.data;
}
