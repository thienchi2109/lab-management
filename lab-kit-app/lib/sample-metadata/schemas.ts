import { z } from "zod";

/** Tập trạng thái hợp lệ của mẫu xét nghiệm trong lát cắt metadata. */
export const SAMPLE_STATUSES = [
  "draft",
  "received",
  "in_progress",
  "completed",
  "archived",
] as const;

/** Tập trạng thái thanh toán hợp lệ của mẫu xét nghiệm. */
export const SAMPLE_BILLING_STATUSES = [
  "unpaid",
  "invoiced",
  "paid",
  "eom_credit",
] as const;

/** Kiểu trạng thái mẫu xét nghiệm được chấp nhận bởi schema. */
export type SampleStatus = (typeof SAMPLE_STATUSES)[number];

/** Kiểu trạng thái thanh toán mẫu xét nghiệm được chấp nhận bởi schema. */
export type SampleBillingStatus = (typeof SAMPLE_BILLING_STATUSES)[number];

/** Kiểm tra giá trị trạng thái mẫu trước khi đưa vào state đã typed. */
export function isSampleStatus(value: string): value is SampleStatus {
  return SAMPLE_STATUSES.some((status) => status === value);
}

/** Kiểm tra giá trị thanh toán mẫu trước khi đưa vào state đã typed. */
export function isSampleBillingStatus(
  value: string
): value is SampleBillingStatus {
  return SAMPLE_BILLING_STATUSES.some((status) => status === value);
}

const INVALID_SAMPLE_MESSAGE = "Thông tin mẫu xét nghiệm không hợp lệ.";
const SAMPLE_CODE_PATTERN = /^T(?:1[0-2]|[1-9])_[0-9]{5}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Lỗi validation metadata mẫu kèm thông báo an toàn theo từng field. */
export class SampleMetadataValidationError extends Error {
  constructor(
    public readonly fieldErrors: Partial<
      Record<keyof UpdateSampleInput, string>
    >
  ) {
    super(INVALID_SAMPLE_MESSAGE);
    this.name = "SampleMetadataValidationError";
  }
}

const nullableUuidSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.uuid().nullable());

const optionalTextSchema = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}, z.string().max(500).nullable());

const requiredTextSchema = z.string().trim().min(1).max(200);
const nullableDateSchema = z.preprocess(
  normalizeEmptyValue,
  z
    .string()
    .refine((value) => DATE_PATTERN.test(value))
    .nullable()
);
const requiredDateSchema = z.preprocess(
  normalizeEmptyValue,
  z.string().refine((value) => DATE_PATTERN.test(value))
);

const sampleInputSchema = z.object({
  sampleCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => SAMPLE_CODE_PATTERN.test(value)),
  sampleTypeId: z.uuid(),
  customerId: nullableUuidSchema,
  companyId: nullableUuidSchema,
  kitBatchId: nullableUuidSchema,
  customerName: requiredTextSchema,
  collectedAt: nullableDateSchema,
  receivedAt: requiredDateSchema,
  status: z.enum(SAMPLE_STATUSES),
  billingStatus: z.enum(SAMPLE_BILLING_STATUSES),
  note: optionalTextSchema,
});

const updateSampleInputSchema = sampleInputSchema.extend({
  sampleId: z.uuid(),
});

/** Input đã parse cho thao tác tạo metadata mẫu xét nghiệm. */
export type CreateSampleInput = z.infer<typeof sampleInputSchema>;

/** Input đã parse cho thao tác cập nhật metadata mẫu xét nghiệm. */
export type UpdateSampleInput = z.infer<typeof updateSampleInputSchema>;

/** Parse unknown create-sample metadata into the internal command shape. */
export function parseCreateSampleInput(input: unknown): CreateSampleInput {
  return parseWithMessage(sampleInputSchema, input);
}

/** Parse unknown update-sample metadata into the internal command shape. */
export function parseUpdateSampleInput(input: unknown): UpdateSampleInput {
  return parseWithMessage(updateSampleInputSchema, input);
}

function parseWithMessage<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new SampleMetadataValidationError(toFieldErrors(result.error));
  }

  return result.data;
}

function normalizeEmptyValue(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  return typeof value === "string" ? value.trim() : value;
}

function toFieldErrors(
  error: z.ZodError
): Partial<Record<keyof UpdateSampleInput, string>> {
  const fieldErrors: Partial<Record<keyof UpdateSampleInput, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      typeof field !== "string" ||
      !isSampleMetadataField(field) ||
      field in fieldErrors
    ) {
      continue;
    }

    const message = sampleMetadataFieldMessages[field];

    if (message) {
      fieldErrors[field] = message;
    }
  }

  return fieldErrors;
}

function isSampleMetadataField(
  value: string
): value is keyof UpdateSampleInput {
  return Object.prototype.hasOwnProperty.call(
    sampleMetadataFieldMessages,
    value
  );
}

const sampleMetadataFieldMessages: Partial<
  Record<keyof UpdateSampleInput, string>
> = {
  sampleId: "Mẫu cần cập nhật không hợp lệ.",
  sampleCode: "Mã mẫu phải có dạng T6_00012.",
  sampleTypeId: "Loại mẫu không hợp lệ.",
  customerId: "Khách hàng không hợp lệ.",
  companyId: "Công ty không hợp lệ.",
  kitBatchId: "Lô KIT không hợp lệ.",
  customerName: "Tên khách hàng là bắt buộc và tối đa 200 ký tự.",
  collectedAt: "Ngày lấy mẫu phải dùng định dạng YYYY-MM-DD.",
  receivedAt: "Ngày nhận phải dùng định dạng YYYY-MM-DD.",
  status: "Trạng thái mẫu không hợp lệ.",
  billingStatus: "Trạng thái thanh toán không hợp lệ.",
  note: "Ghi chú tối đa 500 ký tự.",
};
