// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import SampleMetadataPage from "./page";

import {
  getSampleMetadata,
  SampleMetadataAccessError,
} from "@/lib/sample-metadata/server";

vi.mock("@/lib/sample-metadata/server", () => ({
  getSampleMetadata: vi.fn(),
  SampleMetadataAccessError: class SampleMetadataAccessError extends Error {},
}));

vi.mock("./_components/sample-metadata-page-content", () => ({
  SampleMetadataPageContent: () => null,
}));

describe("SampleMetadataPage", () => {
  test("renders the permission state for metadata access errors", async () => {
    vi.mocked(getSampleMetadata).mockRejectedValue(
      new SampleMetadataAccessError()
    );

    render(await SampleMetadataPage());

    expect(screen.getByText("Không có quyền truy cập")).toBeTruthy();
  });

  test("rethrows non-authorization metadata load errors", async () => {
    vi.mocked(getSampleMetadata).mockRejectedValue(
      new Error("Không thể tải danh sách mẫu xét nghiệm.")
    );

    await expect(SampleMetadataPage()).rejects.toThrow(
      "Không thể tải danh sách mẫu xét nghiệm."
    );
  });
});
