import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { mobileNavItems } from "@/components/layout/navigation-items";

import { userSummaryItems } from "./user-summary-strip";
import { formatUserUpdatedDate } from "./user-table";

describe("US-014 review fixes", () => {
  test("uses consistent Vietnamese copy for the total user summary", () => {
    expect(userSummaryItems.find((item) => item.key === "total")?.label).toBe(
      "Tổng người dùng"
    );
  });

  test("uses the Vietnamese users title in mobile navigation", () => {
    expect(
      mobileNavItems.find((item) => item.url === "/dashboard/users")?.title
    ).toBe("Người dùng");
  });

  test("formats invalid update dates without throwing", () => {
    expect(formatUserUpdatedDate("not-a-date")).toBe("Chưa rõ");
  });

  test("keeps user-management Vietnamese UI copy accented", () => {
    const files = [
      "app/dashboard/users/_components/user-management-client.tsx",
      "app/dashboard/users/_components/user-summary-strip.tsx",
      "app/dashboard/users/_components/user-table.tsx",
      "app/dashboard/users/_components/user-form-dialogs.tsx",
      "app/dashboard/users/page.tsx",
      "app/dashboard/users/actions.ts",
      "lib/user-management/schemas.ts",
      "lib/user-management/last-admin.ts",
    ];
    const bannedPhrases = [
      "Quan ly",
      "nguoi dung",
      "vai tro",
      "trang thai",
      "Them",
      "Tim theo ten",
      "Tat ca",
      "Hoat dong",
      "Tam khoa",
      "Dang hien thi",
      "Khong",
      "Thu doi",
      "tu khoa",
      "bo loc",
      "Cap nhat",
      "Tac vu",
      "Mat khau",
      "Ten hien thi",
      "Dong",
      "Huy",
      "Dang luu",
      "Luu thay doi",
      "Thong tin",
    ];

    const source = files
      .map((file) => readFileSync(path.join(process.cwd(), file), "utf8"))
      .join("\n");

    expect(bannedPhrases.filter((phrase) => source.includes(phrase))).toEqual(
      []
    );
  });
});
