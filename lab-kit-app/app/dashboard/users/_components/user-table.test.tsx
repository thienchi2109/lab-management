import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { ManagedUser } from "@/lib/user-management/users";

import { UserTable } from "./user-table";

const users: ManagedUser[] = [
  {
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
  },
  {
    id: "user-viewer",
    membershipId: "membership-viewer",
    organizationId: "org-1",
    displayName: "Viewer tạm khóa",
    email: "viewer@lab-management.local",
    username: "viewer",
    role: "viewer",
    isActive: false,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-04T00:00:00.000Z",
    initials: "VT",
  },
];

describe("UserTable", () => {
  test("uses the shared data table contract with mobile primary actions", () => {
    const html = renderToStaticMarkup(
      <UserTable users={users} onEdit={() => undefined} />
    );

    expect(html).toContain("Danh sách người dùng");
    expect(html).toContain("Sửa người dùng");
    expect(html).toContain('data-sample-column-key="role"');
    expect(html).toContain('data-sample-column-key="status"');
  });

  test("renders the shared filtered empty state", () => {
    const html = renderToStaticMarkup(
      <UserTable users={[]} onEdit={() => undefined} />
    );

    expect(html).toContain("Không có người dùng phù hợp");
    expect(html).toContain("Thử đổi từ khóa hoặc xóa bộ lọc hiện tại.");
  });
});
