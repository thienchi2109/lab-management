import type { SampleMetadataRequestSample } from "@/components/layout/sample-create-action";
import type { SampleGridRow } from "@/lib/sample-grid/operations";
import {
  isSampleBillingStatus,
  isSampleStatus,
} from "@/lib/sample-metadata/schemas";

/** Chuẩn hóa một dòng Sample Grid thành snapshot metadata gửi qua event side sheet. */
export function toMetadataRequestSample(
  sample: SampleGridRow
): SampleMetadataRequestSample {
  return {
    billingStatus: isSampleBillingStatus(sample.billingStatus)
      ? sample.billingStatus
      : "unpaid",
    collectedAt: null,
    companyId: sample.companyId,
    companyName: sample.companyName,
    customerId: sample.customerId,
    customerName: sample.customerName ?? "Chưa có khách",
    id: sample.id,
    kitBatchId: sample.kitBatchId,
    kitSummary: sample.kitSummary,
    note: null,
    receivedAt: sample.receivedAt,
    resultGroupIds: sample.resultSummary?.groups.map((group) => group.id) ?? [],
    sampleCostAmountVnd: null,
    sampleCostPaymentMethod: null,
    sampleCode: sample.sampleCode,
    sampleTypeId: sample.sampleTypeId,
    sampleTypeName: sample.sampleTypeName,
    status: isSampleStatus(sample.status) ? sample.status : "received",
    updatedAt: sample.updatedAt,
  };
}
