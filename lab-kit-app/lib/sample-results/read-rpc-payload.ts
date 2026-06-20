import { z } from "zod";

import { RESULT_INPUT_TYPES } from "@/lib/result-configuration/configuration";
import type { SampleStatus } from "@/lib/sample-metadata/schemas";
import { SAMPLE_STATUSES } from "@/lib/sample-metadata/schemas";

import {
  normalizeInputType,
  normalizeMetricSettings,
  normalizeOptions,
} from "./metric-row-normalizers";
import type { SampleResultTemplate } from "./operations";

type RpcPayload = {
  sample: {
    id: string;
    sampleCode: string;
    sampleTypeId: string;
    sampleTypeName: string;
    organizationId: string;
    receivedAt: string;
    customerName: string | null;
    companyName: string | null;
    status: SampleStatus;
  };
  template: {
    id: string;
    name: string;
  };
  groups: Array<{
    id: string;
    code: string;
    name: string;
    sortOrder: number;
    metrics: Array<{
      id: string;
      code: string;
      name: string;
      inputType: string;
      unit: string | null;
      options: unknown;
      metricSettings: unknown;
      sortOrder: number;
      isRequired: boolean;
    }>;
  }>;
  results: Array<{
    metricId: string;
    value: unknown;
  }>;
  conclusions: Array<{
    groupId: string;
    kqChung: string;
  }>;
};

const rpcPayloadSchema = z.object({
  sample: z.object({
    id: z.string().min(1),
    sampleCode: z.string().min(1),
    sampleTypeId: z.string().min(1),
    sampleTypeName: z.string().min(1),
    organizationId: z.string().min(1),
    receivedAt: z.string().min(1),
    customerName: z.string().nullable(),
    companyName: z.string().nullable(),
    status: z.enum(SAMPLE_STATUSES),
  }),
  template: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  groups: z.array(
    z.object({
      id: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
      sortOrder: z.number(),
      metrics: z.array(
        z.object({
          id: z.string().min(1),
          code: z.string().min(1),
          name: z.string().min(1),
          inputType: z.enum(RESULT_INPUT_TYPES),
          unit: z.string().nullable(),
          options: z.unknown(),
          metricSettings: z.unknown(),
          sortOrder: z.number(),
          isRequired: z.boolean(),
        })
      ),
    })
  ),
  results: z.array(
    z.object({
      metricId: z.string().min(1),
      value: z.unknown(),
    })
  ),
  conclusions: z.array(
    z.object({
      groupId: z.string().min(1),
      kqChung: z.string(),
    })
  ),
}) satisfies z.ZodType<RpcPayload>;

/** Parse and normalize the trusted server-side payload returned by the read RPC. */
export function parseSampleResultEntryPayload(
  payload: unknown
): SampleResultTemplate | null {
  if (!payload) return null;

  const parsed = rpcPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("Không thể parse payload kết quả mẫu.");
  }

  const value = parsed.data;

  return {
    sample: value.sample,
    template: value.template,
    groups: value.groups.map((group) => ({
      id: group.id,
      code: group.code,
      name: group.name,
      sortOrder: group.sortOrder,
      metrics: group.metrics.map((metric) => ({
        id: metric.id,
        code: metric.code,
        name: metric.name,
        inputType: normalizeInputType(metric.inputType),
        unit: metric.unit,
        options: normalizeOptions(metric.options),
        metricSettings: normalizeMetricSettings(metric.metricSettings),
        sortOrder: metric.sortOrder,
        isRequired: metric.isRequired,
      })),
    })),
    results: value.results,
    conclusions: value.conclusions,
  };
}
