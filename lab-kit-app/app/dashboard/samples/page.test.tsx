// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import SampleGridPage from "./page";

import {
  getSampleGridPage,
  SampleGridAccessError,
} from "@/lib/sample-grid/server";

vi.mock("@/lib/sample-grid/server", () => ({
  getSampleGridPage: vi.fn(),
  SampleGridAccessError: class SampleGridAccessError extends Error {},
}));

vi.mock("./_components/sample-grid-page-content", () => ({
  SampleGridPageContent: () => <div>Bảng mẫu xét nghiệm</div>,
}));

describe("SampleGridPage", () => {
  test("loads sample grid data from URL state", async () => {
    vi.mocked(getSampleGridPage).mockResolvedValue({
      capabilities: {
        canEnterResults: true,
        canManageImages: true,
        canUpdateMetadata: false,
      },
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        page: 1,
        pageSize: 25,
        totalCount: 0,
        totalPages: 0,
      },
      query: {
        filters: {},
        limit: 25,
        offset: 0,
        page: 1,
        pageSize: 25,
        search: "T6_00012",
        sort: { direction: "desc", key: "receivedAt" },
      },
      rows: [],
    });

    render(
      await SampleGridPage({
        searchParams: Promise.resolve({ search: "T6_00012" }),
      })
    );

    expect(getSampleGridPage).toHaveBeenCalledWith({ search: "T6_00012" });
    expect(screen.getByText("Bảng mẫu xét nghiệm")).toBeTruthy();
  });

  test("renders the permission state for sample grid access errors", async () => {
    vi.mocked(getSampleGridPage).mockRejectedValue(new SampleGridAccessError());

    render(await SampleGridPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Không có quyền truy cập")).toBeTruthy();
  });

  test("rethrows non-authorization sample grid load errors", async () => {
    vi.mocked(getSampleGridPage).mockRejectedValue(
      new Error("Không thể tải danh sách mẫu xét nghiệm.")
    );

    await expect(
      SampleGridPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("Không thể tải danh sách mẫu xét nghiệm.");
  });
});
