import type { ResultInputType } from "@/lib/result-configuration/configuration";
import type { SampleStatus } from "@/lib/sample-metadata/schemas";

import {
  isAbnormalMetricValue,
  isPositivePcrValue,
  validateMetricValue,
} from "./validation";

/** Actor đang thao tác kết quả mẫu, đã resolve tổ chức và quyền ghi. */
export type SampleResultActor = {
  profileId: string;
  organizationId: string;
  canWrite: boolean;
};

/** Chỉ tiêu trong template kết quả dùng cho form nhập động. */
export type SampleResultMetric = {
  id: string;
  code: string;
  name: string;
  inputType: ResultInputType;
  unit: string | null;
  options: unknown[];
  metricSettings: Record<string, unknown>;
  sortOrder: number;
  isRequired: boolean;
};

/** Nhóm kết quả cùng danh sách chỉ tiêu hợp lệ theo template mẫu. */
export type SampleResultGroup = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  metrics: SampleResultMetric[];
};

/** Kết quả đã lưu cho một chỉ tiêu của mẫu. */
export type StoredSampleResult = {
  metricId: string;
  value: unknown;
};

/** Kết luận đã lưu cho một nhóm kết quả của mẫu. */
export type StoredGroupConclusion = {
  groupId: string;
  kqChung: string;
};

/** Template nhập kết quả đã được hydrate cùng mẫu, nhóm, kết quả hiện có. */
export type SampleResultTemplate = {
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
  groups: SampleResultGroup[];
  results: StoredSampleResult[];
  conclusions: StoredGroupConclusion[];
};

/** View model nhập kết quả có thêm tiến độ và trạng thái từng nhóm. */
export type SampleResultEntry = Omit<SampleResultTemplate, "groups"> & {
  groups: Array<
    SampleResultGroup & {
      enteredMetrics: number;
      totalMetrics: number;
      kqChung: string | null;
      abnormalMetrics: number;
    }
  >;
};

/** Payload API/client gửi khi lưu kết quả động của một mẫu. */
export type SaveSampleResultsInput = {
  results: Array<{
    metricId: string;
    value: unknown;
  }>;
  groupConclusions: Array<{
    groupId: string;
    conclusionText: string;
  }>;
};

/** Payload transaction hạ tầng để upsert kết quả, kết luận và audit. */
export type SampleResultsTransactionInput = {
  sampleId: string;
  organizationId: string;
  actorId: string;
  results: StoredSampleResult[];
  conclusions: Array<{
    groupId: string;
    kqChung: string;
    calculatedFrom: Record<string, unknown>;
  }>;
  auditEvent: {
    action: "sample_results.updated";
    entityTable: "sample_results";
    entityId: string;
    eventPayload: Record<string, unknown>;
  };
};

/** Cổng hạ tầng cho query template mẫu và transaction lưu kết quả. */
export type SampleResultsPort = {
  getTemplateForSample(input: {
    sampleId: string;
    organizationId: string;
  }): Promise<SampleResultTemplate | null>;
  saveResultsTransaction(input: SampleResultsTransactionInput): Promise<void>;
};

const MISSING_SAMPLE_MESSAGE =
  "Mẫu xét nghiệm không tồn tại hoặc không thuộc tổ chức hiện tại.";
const INVALID_METRIC_MESSAGE = "Chỉ tiêu không thuộc template hợp lệ của mẫu";
const INVALID_GROUP_MESSAGE =
  "Nhóm kết quả không thuộc template hợp lệ của mẫu";

/** Load entry kết quả mẫu và tính tiến độ hiển thị theo từng nhóm. */
export async function getSampleResultEntry(
  sampleId: string,
  actor: SampleResultActor,
  port: SampleResultsPort
): Promise<SampleResultEntry> {
  const template = await loadTemplate(sampleId, actor, port);
  const values = new Map(
    template.results.map((result) => [result.metricId, result.value])
  );
  const conclusions = new Map(
    template.conclusions.map((item) => [item.groupId, item.kqChung])
  );

  return {
    ...template,
    groups: template.groups.map((group) => ({
      ...group,
      totalMetrics: group.metrics.length,
      enteredMetrics: group.metrics.filter((metric) =>
        hasEnteredValue(values.get(metric.id))
      ).length,
      kqChung: conclusions.get(group.id) ?? null,
      abnormalMetrics: group.metrics.filter((metric) =>
        isAbnormalMetricValue(metric, values.get(metric.id))
      ).length,
    })),
  };
}

/** Validate payload lưu kết quả, tính Kết Quả Chung, rồi gọi transaction port. */
export async function saveSampleResults(
  sampleId: string,
  input: SaveSampleResultsInput,
  actor: SampleResultActor,
  port: SampleResultsPort
): Promise<void> {
  if (!actor.canWrite) {
    throw new Error("Bạn không có quyền ghi kết quả xét nghiệm.");
  }

  const template = await loadTemplate(sampleId, actor, port);
  const metricById = new Map(
    template.groups.flatMap((group) =>
      group.metrics.map((metric) => [metric.id, metric] as const)
    )
  );

  const nextResults = input.results.map((result) => {
    const metric = metricById.get(result.metricId);

    if (!metric) {
      throw new Error(`${INVALID_METRIC_MESSAGE}: ${result.metricId}.`);
    }

    return {
      metricId: result.metricId,
      value: validateMetricValue(metric, result.value),
    };
  });

  await port.saveResultsTransaction({
    sampleId,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    results: nextResults,
    conclusions: buildConclusions(template, nextResults, input),
    auditEvent: {
      action: "sample_results.updated",
      entityTable: "sample_results",
      entityId: sampleId,
      eventPayload: {
        resultCount: nextResults.length,
        groupConclusionCount: input.groupConclusions.length,
      },
    },
  });
}

async function loadTemplate(
  sampleId: string,
  actor: SampleResultActor,
  port: SampleResultsPort
) {
  const template = await port.getTemplateForSample({
    sampleId,
    organizationId: actor.organizationId,
  });

  if (!template) {
    throw new Error(MISSING_SAMPLE_MESSAGE);
  }

  return template;
}

function buildConclusions(
  template: SampleResultTemplate,
  nextResults: StoredSampleResult[],
  input: SaveSampleResultsInput
) {
  const groupIds = new Set(template.groups.map((group) => group.id));

  for (const item of input.groupConclusions) {
    if (!groupIds.has(item.groupId)) {
      throw new Error(`${INVALID_GROUP_MESSAGE}: ${item.groupId}.`);
    }
  }

  const valueByMetricId = new Map(
    template.results.map((result) => [result.metricId, result.value])
  );

  for (const result of nextResults) {
    valueByMetricId.set(result.metricId, result.value);
  }

  const textByGroupId = new Map(
    input.groupConclusions.map((item) => [
      item.groupId,
      (item.conclusionText ?? "").trim(),
    ])
  );

  return template.groups.flatMap((group) => {
    if (isPcrGroup(group)) {
      const positiveMetricIds: string[] = [];

      for (const metric of group.metrics) {
        if (isPositivePcrValue(valueByMetricId.get(metric.id))) {
          positiveMetricIds.push(metric.id);
        }
      }

      return [
        {
          groupId: group.id,
          kqChung: positiveMetricIds.length > 0 ? "NHIỄM" : "SẠCH",
          calculatedFrom: {
            rule: "pcr-status",
            positiveMetricIds,
          },
        },
      ];
    }

    const conclusionText = textByGroupId.get(group.id);

    return conclusionText
      ? [
          {
            groupId: group.id,
            kqChung: conclusionText,
            calculatedFrom: { rule: "manual-text" },
          },
        ]
      : [];
  });
}

function hasEnteredValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function isPcrGroup(group: SampleResultGroup) {
  return group.metrics.some((metric) => metric.inputType.startsWith("pcr_"));
}
