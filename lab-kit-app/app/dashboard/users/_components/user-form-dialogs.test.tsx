// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import type { ManagedUser } from "@/lib/user-management/users";

import { EditUserDialog } from "./user-form-dialogs";

vi.mock("../actions", () => ({
  initialUserActionState: { status: "idle", message: "" },
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
}));

const user: ManagedUser = {
  id: "user-admin",
  membershipId: "membership-admin",
  organizationId: "org-1",
  displayName: "Admin chính",
  email: "admin@lab-management.local",
  username: "admin",
  role: "admin",
  isActive: true,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z",
  initials: "AC",
};

describe("User form dialogs", () => {
  test("keeps permission-sensitive controls close to guard copy", () => {
    const html = renderToStaticMarkup(
      <EditUserDialog user={user} onClose={() => undefined} />
    );

    expect(html).toContain("Quyền truy cập");
    expect(html).toContain(
      "Chỉ Admin được thay đổi vai trò hoặc trạng thái truy cập."
    );
    expect(html).toContain(
      "Hệ thống vẫn chặn hạ quyền hoặc tạm khóa Admin hoạt động cuối cùng."
    );
    expect(html).toContain("Lưu thay đổi");
  });
});
