// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import type { ManagedUser } from "@/lib/user-management/users";

import { UserManagementClient } from "./user-management-client";

vi.mock("./user-form-dialogs", () => ({
  CreateUserDialog: () => null,
  EditUserDialog: () => null,
}));

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

describe("UserManagementClient", () => {
  test("renders a mobile-first command surface with clear filter affordance", () => {
    render(
      <UserManagementClient
        users={users}
        summary={{ total: 2, active: 1, admins: 1, inactive: 1 }}
      />
    );

    expect(screen.getByText("Tìm nhanh người dùng")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Tên, username hoặc email")
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Xóa bộ lọc" })
        .disabled
    ).toBe(true);
    expect(
      screen.getByText("Tìm kiếm là thao tác chính trên mobile")
    ).toBeTruthy();
  });
});
