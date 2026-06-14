/** Tên event toàn cục yêu cầu trang Samples mở modal tạo mẫu. */
export const sampleCreateRequestedEvent = "lab:samples:create-requested";

/** Yêu cầu bề mặt Samples mở modal tạo mẫu nếu đang được mount. */
export function requestSampleCreate() {
  window.dispatchEvent(new Event(sampleCreateRequestedEvent));
}
