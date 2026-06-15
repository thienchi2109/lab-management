# Design

## Direction

Tách `SampleResultsClient` thành các khối rõ: sample summary, result groups,
image panel. Dùng component cục bộ nếu summary chỉ phục vụ route này; chỉ đưa
shared khi có caller khác cần.

## Interface Contract

- Sample summary là khối đầu tiên trong form/page.
- Result groups giữ `ResultGroupAccordion` hoặc primitive tương đương.
- Image panel chuyển xuống cuối.
- Save action vẫn ở header hoặc sticky action area nếu cần để không bị mất khả
  năng thao tác.

## Component Scope

- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/sample-results-client.tsx`
- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/result-group-accordion.tsx`
- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.tsx`
- result page tests.

## Error Handling

Nếu sample thiếu công ty/khách hàng/nhóm, summary hiển thị fallback ngắn gọn,
không làm fail route.

## Testing Focus

Test phải khóa thứ tự render vì đây là feedback chính của khách hàng.

