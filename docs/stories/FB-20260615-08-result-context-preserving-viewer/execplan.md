# Exec Plan

## Goal

Cho phép xem kết quả từ danh sách mẫu mà không làm mất context danh sách do điều
hướng sang trang khác.

## TDD Flow

1. RED: test hoặc browser spec chứng minh nhấn `Xem kết quả` hiện làm mất context
   danh sách hoặc chuyển route khỏi danh sách.
2. RED: test preserve state cho filter/search/sort/page hoặc state danh sách đang
   có trong implementation hiện tại.
3. DISCOVERY: dùng Code Review Graph trước để map flow danh sách mẫu, action
   `Xem kết quả`, route kết quả, và component kết quả có thể reuse.
4. GREEN: thêm result viewer overlay responsive từ danh sách mẫu, không reset
   context.
5. GREEN: tái dùng nội dung kết quả hiện tại hoặc tách component dùng chung nếu
   cần để giữ file dưới 350 dòng.
6. GREEN: giữ deep link route kết quả hiện tại hoạt động.
7. REGRESSION: xác nhận save/read-only behavior không đổi.
8. REFACTOR: gom shared shell/hook nếu xuất hiện duplication rõ ràng và vẫn trong
   scope.

## Stop Conditions

- Nếu cần đổi data model, RPC, upload ảnh hoặc quyền truy cập, dừng và tách story.
- Nếu route kết quả hiện tại không thể reuse mà phải rewrite flow nhập kết quả,
  dừng để tách slice hoặc nâng risk.
- Nếu file chạm ngưỡng 350 dòng, tách component trước khi tiếp tục.
- Nếu unsaved-change behavior hiện chưa tồn tại và cần thiết kế rộng, ghi follow-up
  hoặc mở slice riêng thay vì xử lý ngầm.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- app/dashboard/samples
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```

Nếu có browser/e2e coverage sẵn cho danh sách mẫu, bổ sung lệnh e2e tương ứng vào
story trước khi đánh dấu implemented.
