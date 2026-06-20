// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ComponentProps } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { SampleImagesPanel } from "./sample-images-panel";
import { deleteSampleImageRequest } from "./sample-image-requests";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    height: _height,
    src,
    width: _width,
    ...props
  }: ComponentProps<"img">) => createElement("img", { alt, src, ...props }),
}));

vi.mock("./sample-image-requests", () => ({
  deleteSampleImageRequest: vi.fn(),
  uploadSampleImageRequest: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function createImages(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `image-${index + 1}`,
    contentType: index % 2 === 0 ? "image/png" : "image/webp",
    createdAt: "2026-06-07T00:00:00.000Z",
    publicId: `lab-management/org-1/sample-1/evidence-${index + 1}`,
    secureUrl: `https://res.cloudinary.com/lab/image/upload/evidence-${index + 1}`,
    sizeBytes: 2048,
  }));
}

describe("Sample image gallery preview", () => {
  test("renders the approved compact mobile gallery header", () => {
    const { container } = render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={createImages(3)}
        sampleId="sample-1"
      />
    );

    expect(screen.getByText("3/20 ảnh")).toBeTruthy();
    expect(screen.getByText("JPEG, PNG, WEBP · tối đa 5 MB/ảnh")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Chụp ảnh" }).className
    ).toContain("size-11");
    expect(
      screen.getByRole("button", { name: "Thư viện" }).className
    ).toContain("size-11");
    expect(container.innerHTML).toContain("sr-only sm:not-sr-only");
  });

  test("uses a three-column thumbnail grid with overlay chips", () => {
    const { container } = render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={createImages(3)}
        sampleId="sample-1"
      />
    );

    expect(container.innerHTML).toContain("grid-cols-3");
    expect(container.innerHTML).not.toContain("grid-cols-2");
    expect(screen.getByText("#1")).toBeTruthy();
    expect(screen.getByText("#2")).toBeTruthy();
    expect(screen.getAllByText("PNG")).toHaveLength(2);
    expect(screen.getByText("WEBP")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Xóa ảnh minh chứng 1" }).className
    ).toContain("absolute right-1 top-1");
  });

  test("opens the selected thumbnail in a large preview and closes it", async () => {
    render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={createImages(3)}
        sampleId="sample-1"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Mở ảnh minh chứng 2" })
    );

    expect(
      screen.getByRole("heading", { name: "Ảnh minh chứng 2/3" })
    ).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Xem ảnh minh chứng evidence-2" })
    ).toBeTruthy();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Đóng preview" })[1]
    );

    expect(
      screen.queryByRole("heading", { name: "Ảnh minh chứng 2/3" })
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Mở ảnh minh chứng 2" })
    ).toBeTruthy();
  });

  test("moves within the preview and disables navigation at list boundaries", async () => {
    render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={createImages(3)}
        sampleId="sample-1"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Mở ảnh minh chứng 1" })
    );

    expect(
      (screen.getByRole("button", { name: "Ảnh trước" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    await userEvent.click(
      screen.getByRole("button", { name: "Ảnh tiếp theo" })
    );
    expect(
      screen.getByRole("heading", { name: "Ảnh minh chứng 2/3" })
    ).toBeTruthy();

    await userEvent.click(
      screen.getByRole("button", { name: "Ảnh tiếp theo" })
    );
    expect(
      screen.getByRole("heading", { name: "Ảnh minh chứng 3/3" })
    ).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Ảnh tiếp theo",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "Ảnh trước" }));
    expect(
      screen.getByRole("heading", { name: "Ảnh minh chứng 2/3" })
    ).toBeTruthy();
  });

  test("keeps viewer preview read-only while editors can delete the selected image", async () => {
    vi.mocked(deleteSampleImageRequest).mockResolvedValue({
      refresh: true,
      state: { status: "success", message: "Đã xóa ảnh minh chứng." },
    });

    const { rerender } = render(
      <SampleImagesPanel
        canWrite={false}
        initialImages={createImages(2)}
        sampleId="sample-1"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Mở ảnh minh chứng 1" })
    );

    expect(
      screen.queryByRole("button", { name: "Xóa ảnh minh chứng 1" })
    ).toBeNull();
    await userEvent.click(
      screen.getAllByRole("button", { name: "Đóng preview" })[1]
    );

    rerender(
      <SampleImagesPanel
        canWrite={true}
        initialImages={createImages(2)}
        sampleId="sample-1"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Mở ảnh minh chứng 2" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Xóa ảnh minh chứng 2" })
    );

    await waitFor(() =>
      expect(deleteSampleImageRequest).toHaveBeenCalledWith(
        "sample-1",
        "image-2"
      )
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("uses a dark mobile lightbox surface with large rail controls", async () => {
    const { container } = render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={createImages(3)}
        sampleId="sample-1"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Mở ảnh minh chứng 2" })
    );

    expect(container.innerHTML).toContain("bg-[#101828]");
    expect(screen.getByText("WEBP · evidence-2")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Ảnh trước" }).className
    ).toContain("size-11");
    expect(
      screen.getByRole("button", { name: "Ảnh tiếp theo" }).className
    ).toContain("size-11");
    expect(
      screen.getByRole("button", { name: "Xóa ảnh minh chứng 2" }).className
    ).toContain("size-11");
  });
});
