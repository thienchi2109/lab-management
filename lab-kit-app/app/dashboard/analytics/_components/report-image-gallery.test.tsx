// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ComponentProps } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ReportImageGallery } from "./report-image-gallery";

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
});
