# Design

## Current Behavior

`listSampleGridPage` attach result summaries vào rows của page hiện tại, sau đó
dựng `resultColumnOptions` từ các group và metric xuất hiện trong rows đó.
Khi search, filter hoặc phân trang đổi tập mẫu đang hiển thị, options có thể
thay đổi dù cấu hình result template của tenant không đổi.

## Target Behavior

`SampleGridPort` cung cấp nguồn đọc result column options ổn định. Supabase
adapter đọc từ active `result_templates`, `result_template_metrics`,
`result_metrics` và `result_groups` theo `organization_id`.

Nếu query đang filter `sampleTypeId`, nguồn options được giới hạn theo sample
type đó. Nếu không có filter sample type, nguồn options lấy hợp nhất từ active
templates của tenant để options ổn định qua page/search/status.

## Reuse Decision

Repo đã có logic đọc template/assignment/metric/group trong
`lib/sample-grid/result-summary-server.ts`, nhưng file đó phục vụ summary theo
sample ids của page hiện tại. Issue này cần nguồn schema độc lập với page rows,
nên tạo module gần `sample-grid` thay vì mở rộng summary mapper theo hướng lẫn
trách nhiệm.

## UI Impact

`ResultColumnModeControls` tiếp tục render từ `page.resultColumnOptions`.
`SampleGridTableSection` tiếp tục render selected columns từ
`page.selectedResultColumnKeys`. UI không cần đổi layout.
