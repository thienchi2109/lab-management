# Exec Plan

## Goal

Sắp xếp lại màn hình `Mở kết quả` theo thứ tự thông tin mẫu -> kết quả -> ảnh.

## TDD Flow

1. RED: component test chứng minh thứ tự render hiện sai theo target.
2. RED: test sample summary có các trường cần thiết.
3. GREEN: thêm summary component và dời `SampleImagesPanel` xuống cuối.
4. GREEN: giữ save action/read-only behavior.
5. REFACTOR: tách component nếu `sample-results-client.tsx` tiến gần 350 dòng.

## Stop Conditions

- Dừng nếu data hiện tại không có đủ thông tin nhóm chỉ tiêu để hiển thị summary
  trước khi story multi-group hoàn tất.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- app/dashboard/samples/[sampleId]/results/_components/sample-results-client.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```

