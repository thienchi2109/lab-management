import { z } from "zod";

import { RESULT_INPUT_TYPES } from "./configuration";

const INVALID_CONFIGURATION_MESSAGE =
  "Thông tin cấu hình chỉ tiêu không hợp lệ.";
const CODE_PATTERN = /^[A-Z0-9_]{2,64}$/;

const activeStateSchema = z.preprocess((value) => {
  if (value === true || value === "true" || value === "on") return true;
  if (value === false || value === "false" || value === null) return false;
  return value;
}, z.boolean());

const sortOrderSchema = z.coerce.number().int().min(0).max(9999);
const nameSchema = z.string().trim().min(1).max(160);
const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => CODE_PATTERN.test(value));
const jsonArraySchema = z
  .string()
  .optional()
  .transform((value) => parseJson(value ?? "[]"))
  .pipe(z.array(z.unknown()));
const jsonObjectSchema = z
  .string()
  .optional()
  .transform((value) => parseJson(value ?? "{}"))
  .pipe(z.record(z.string(), z.unknown()));

const groupInputSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  sortOrder: sortOrderSchema,
  isActive: activeStateSchema,
});

const metricInputSchema = z.object({
  resultGroupId: z.uuid(),
  code: codeSchema,
  name: nameSchema,
  inputType: z.enum(RESULT_INPUT_TYPES),
  unit: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .optional()
    .nullable(),
  optionsJson: jsonArraySchema,
  settingsJson: jsonObjectSchema,
  sortOrder: sortOrderSchema,
  isRequired: activeStateSchema,
  isActive: activeStateSchema,
});

const templateInputSchema = z.object({
  sampleTypeId: z.uuid(),
  code: codeSchema,
  name: nameSchema,
  isActive: activeStateSchema,
});

const templateMetricInputSchema = z
  .object({
    resultTemplateId: z.uuid(),
    metricIds: z.array(z.uuid()),
  })
  .transform((input) => ({
    resultTemplateId: input.resultTemplateId,
    metricIds: Array.from(new Set(input.metricIds)),
  }));

export type GroupInput = z.infer<typeof groupInputSchema>;
export type MetricInput = Omit<
  z.infer<typeof metricInputSchema>,
  "optionsJson" | "settingsJson"
> & {
  options: unknown[];
  metricSettings: Record<string, unknown>;
};
export type TemplateInput = z.infer<typeof templateInputSchema>;
export type TemplateMetricInput = z.infer<typeof templateMetricInputSchema>;

export function parseGroupInput(input: unknown): GroupInput {
  return parseWithMessage(groupInputSchema, input);
}

export function parseMetricInput(input: unknown): MetricInput {
  const result = parseWithMessage(metricInputSchema, input);

  return {
    resultGroupId: result.resultGroupId,
    code: result.code,
    name: result.name,
    inputType: result.inputType,
    unit: result.unit ?? null,
    options: result.optionsJson,
    metricSettings: result.settingsJson,
    sortOrder: result.sortOrder,
    isRequired: result.isRequired,
    isActive: result.isActive,
  };
}

export function parseTemplateInput(input: unknown): TemplateInput {
  return parseWithMessage(templateInputSchema, input);
}

export function parseTemplateMetricInput(input: unknown): TemplateMetricInput {
  return parseWithMessage(templateMetricInputSchema, input);
}

function parseWithMessage<T extends z.ZodType>(
  schema: T,
  input: unknown
): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new Error(INVALID_CONFIGURATION_MESSAGE);
  }

  return result.data;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(INVALID_CONFIGURATION_MESSAGE);
  }
}
