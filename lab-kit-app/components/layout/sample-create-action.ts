import type { SampleMetadataRow } from "@/lib/sample-metadata/metadata";

/** Tên event toàn cục yêu cầu trang Samples mở modal tạo mẫu. */
export const sampleCreateRequestedEvent = "lab:samples:create-requested";

/** Tên event toàn cục yêu cầu trang Samples mở side sheet xem metadata mẫu. */
export const sampleMetadataViewRequestedEvent = "lab:samples:view-requested";

/** Tên event toàn cục yêu cầu trang Samples mở side sheet sửa metadata mẫu. */
export const sampleMetadataEditRequestedEvent = "lab:samples:edit-requested";

/** Snapshot metadata mẫu đủ để side sheet mở khi layout metadata chưa đồng bộ. */
export type SampleMetadataRequestSample = Omit<
  SampleMetadataRow,
  "collectedAt" | "note"
> &
  Partial<Pick<SampleMetadataRow, "collectedAt" | "note">>;

type SampleMetadataRequestDetail = {
  sampleId: string;
  sample?: SampleMetadataRequestSample;
};

/** Yêu cầu bề mặt Samples mở modal tạo mẫu nếu đang được mount. */
export function requestSampleCreate() {
  window.dispatchEvent(new Event(sampleCreateRequestedEvent));
}

/** Yêu cầu bề mặt Samples mở side sheet xem metadata mẫu. */
export function requestSampleMetadataView(
  sample: string | SampleMetadataRequestSample
) {
  window.dispatchEvent(
    new CustomEvent<SampleMetadataRequestDetail>(
      sampleMetadataViewRequestedEvent,
      { detail: toSampleMetadataRequestDetail(sample) }
    )
  );
}

/** Yêu cầu bề mặt Samples mở side sheet sửa metadata mẫu. */
export function requestSampleMetadataEdit(
  sample: string | SampleMetadataRequestSample
) {
  window.dispatchEvent(
    new CustomEvent<SampleMetadataRequestDetail>(
      sampleMetadataEditRequestedEvent,
      { detail: toSampleMetadataRequestDetail(sample) }
    )
  );
}

function toSampleMetadataRequestDetail(
  sample: string | SampleMetadataRequestSample
): SampleMetadataRequestDetail {
  return typeof sample === "string"
    ? { sampleId: sample }
    : { sampleId: sample.id, sample };
}
