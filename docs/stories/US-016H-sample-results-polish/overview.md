# US-016H - Polish nhập kết quả mẫu

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/samples/[sampleId]/results` để màn hình nhập/xem kết quả mẫu
và ảnh minh chứng rõ hơn trên desktop/mobile. Không đổi result save payload,
image upload/delete contract, `canWrite` permission, API routes, audit behavior
hoặc schema contract.

Story này mở rộng roadmap US-016 sau US-016A-E. Đây là workflow có thao tác ghi,
nên mọi nhu cầu đổi behavior phải tách story riêng.

## Current Behavior

Route hiện load result entry server-side, render `SampleResultsClient`, hiển thị
ảnh minh chứng, nhóm kết quả dạng accordion và nút lưu khi actor có quyền ghi.
UI cần polish cho hierarchy, read-only state, pending/error/success message,
accordion density, media panel và mobile ergonomics.

## Acceptance Criteria

- Header làm rõ sample code, template và quyền hiện tại mà không thêm workflow
  mới.
- Read-only viewer state rõ, không thấy affordance ghi sai quyền.
- Save action, pending state, success/error feedback và refresh behavior giữ
  nguyên contract nhưng dễ nhận biết hơn.
- Image panel scan tốt hơn, upload/delete affordances rõ và không tràn mobile.
- Result group accordion/input layout dễ thao tác trên mobile, label/value/error
  states rõ.
- Không đổi `createSavePayloadFromForm`, API request shape, image route auth,
  sample-results operations hoặc `canWrite` logic.

## Relevant Files

- `lab-kit-app/app/dashboard/samples/[sampleId]/results/page.tsx`
- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/sample-results-client.tsx`
- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/result-group-accordion.tsx`
- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/metric-input-renderer.tsx`
- `lab-kit-app/app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.tsx`
- `lab-kit-app/lib/sample-results/*`
- `lab-kit-app/lib/sample-images/*`
- `docs/stories/US-007-dynamic-result-entry-engine.md`
- `docs/stories/US-008-cloudinary-sample-image-upload/*`
