import type { SampleGridPage } from "@/lib/sample-grid/operations";

/** Ghi các tham số filter mẫu hiện hành vào URLSearchParams. */
export function appendSampleGridFilterParams(
  params: URLSearchParams,
  page: SampleGridPage,
  removedGroupId?: string
) {
  if (page.query.search) params.set("search", page.query.search);
  appendOptionalParam(params, "receivedFrom", page.query.filters.receivedFrom);
  appendOptionalParam(params, "receivedTo", page.query.filters.receivedTo);
  appendOptionalParam(params, "sampleTypeId", page.query.filters.sampleTypeId);
  appendOptionalParam(params, "customerId", page.query.filters.customerId);
  appendOptionalParam(params, "customerName", page.query.filters.customerName);
  appendOptionalParam(params, "companyId", page.query.filters.companyId);
  appendOptionalParam(params, "companyName", page.query.filters.companyName);
  for (const groupId of page.query.filters.resultGroupIds ?? []) {
    if (groupId !== removedGroupId) {
      params.append("resultGroupIds", groupId);
    }
  }
}

function appendOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined
) {
  if (value) {
    params.set(key, value);
  }
}
