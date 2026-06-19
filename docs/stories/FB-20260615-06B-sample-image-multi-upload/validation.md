# Validation

## Proof Strategy

Story hoàn tất khi tests chứng minh upload nhiều file hoạt động theo queue,
không vượt slot, không phá delete audit/provider cleanup và Viewer vẫn read-only.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Slot remaining, batch vượt slot, per-file failure state. |
| Integration | Upload metadata API, duplicate public ID, delete audit payload, provider cleanup. |
| Component | Multi-file select, upload progress, Viewer read-only, delete icon còn accessible. |
| Platform | Typecheck, React Doctor diff, docstring gate nếu thêm named exports. |

## Acceptance Evidence

Implemented on 2026-06-19:

- Component test chứng minh input `Thư viện` có `multiple`, input `Chụp ảnh`
  vẫn single-file, Viewer vẫn read-only và nút xóa vẫn accessible.
- Queue upload xử lý tuần tự qua từng file, chỉ lấy số file bằng slot còn lại
  theo `MAX_IMAGES_PER_SAMPLE = 20`, báo số ảnh bị bỏ qua khi chọn vượt slot.
- Queue tiếp tục sau lỗi một file và hiển thị lỗi gắn với tên file; pending
  luôn được kết thúc bằng `try/finally`.
- Không đổi gallery preview/lightbox, DB/RPC hoặc Cloudinary provider behavior.
- Delete audit/provider cleanup được giữ bằng suite `lib/sample-images`.

Proof:

```bash
cd lab-kit-app && bun run test -- lib/sample-images \
  app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify FB-20260615-06B
```

Kết quả: 6 test files / 28 tests pass, typecheck pass, React Doctor diff không
có issue, docstring gate pass và Harness story verify pass.
