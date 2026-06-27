// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ComponentProps } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ReportImageGallery } from "./report-image-gallery";
import { uploadReportImageRequest } from "./report-image-requests";

vi.mock("next/image", () => ({
  default: ({
    alt,
    height: _height,
    src,
    width: _width,
    ...props
  }: ComponentProps<"img">) => createElement("img", { alt, src, ...props }),
}));

vi.mock("./report-image-requests", () => ({
  deleteReportImageRequest: vi.fn(),
  uploadReportImageRequest: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ReportImageGallery", () => {
  function createImages(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      contentType: "image/webp",
      createdAt: "2026-06-27T00:00:00.000Z",
      id: `report-image-${index + 1}`,
      publicId: `lab-management/org-1/reports/report-${index + 1}`,
      secureUrl: `https://res.cloudinary.com/lab/image/upload/report-${index + 1}`,
      sizeBytes: 2048,
    }));
  }

  test("formats small report images in KB and larger report images in MB", () => {
    render(
      <ReportImageGallery
        canManage={false}
        initialImages={[
          {
            contentType: "image/webp",
            createdAt: "2026-06-27T00:00:00.000Z",
            id: "small-report-image",
            publicId: "lab-management/org-1/reports/small",
            secureUrl: "https://res.cloudinary.com/lab/image/upload/small",
            sizeBytes: 2048,
          },
          {
            contentType: "image/png",
            createdAt: "2026-06-27T00:00:00.000Z",
            id: "large-report-image",
            publicId: "lab-management/org-1/reports/large",
            secureUrl: "https://res.cloudinary.com/lab/image/upload/large",
            sizeBytes: 2 * 1024 * 1024,
          },
        ]}
      />
    );

    expect(screen.getByText("2.0 KB")).toBeTruthy();
    expect(screen.getByText("2.0 MB")).toBeTruthy();
  });

  test("declares responsive image sizes for the report gallery grid", () => {
    render(
      <ReportImageGallery canManage={false} initialImages={createImages(1)} />
    );

    expect(
      screen.getByRole("img", { name: "Ảnh báo cáo" }).getAttribute("sizes")
    ).toBe("(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw");
  });

  test("ignores file changes after the gallery reaches its image limit", () => {
    vi.mocked(uploadReportImageRequest).mockResolvedValue({
      state: { message: "", status: "idle" },
    });

    render(
      <ReportImageGallery canManage={true} initialImages={createImages(20)} />
    );

    fireEvent.change(screen.getByLabelText("Chọn ảnh báo cáo"), {
      target: {
        files: [new File(["report"], "report.webp", { type: "image/webp" })],
      },
    });

    expect(uploadReportImageRequest).not.toHaveBeenCalled();
  });
});
