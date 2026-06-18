// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ComponentProps } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { SampleImagesPanel } from "./sample-images-panel";
import {
  deleteSampleImageRequest,
  uploadSampleImageRequest,
} from "./sample-image-requests";

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

const images = [
  {
    id: "image-1",
    contentType: "image/png",
    createdAt: "2026-06-07T00:00:00.000Z",
    publicId: "lab-management/org-1/sample-1/evidence-1",
    secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
    sizeBytes: 2048,
  },
];

describe("SampleImagesPanel", () => {
  test("renders existing evidence images and upload controls for editors", async () => {
    vi.mocked(uploadSampleImageRequest).mockResolvedValue({
      refresh: true,
      state: { status: "success", message: "Đã tải ảnh minh chứng." },
    });
    vi.mocked(deleteSampleImageRequest).mockResolvedValue({
      refresh: true,
      state: { status: "success", message: "Đã xóa ảnh minh chứng." },
    });

    render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={images}
        sampleId="sample-1"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Ảnh minh chứng" })
    ).toBeTruthy();
    expect(screen.getByRole("img", { name: /evidence-1/ })).toBeTruthy();
    expect(screen.getByText("image/png")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: /Thư viện/ }));
    await userEvent.upload(
      screen.getByLabelText("Chọn ảnh từ thư viện") as HTMLInputElement,
      new File(["image"], "evidence.png", { type: "image/png" })
    );
    await waitFor(() =>
      expect(uploadSampleImageRequest).toHaveBeenCalledWith(
        "sample-1",
        expect.any(File)
      )
    );

    await userEvent.click(screen.getByRole("button", { name: "Xóa ảnh" }));
    await waitFor(() =>
      expect(deleteSampleImageRequest).toHaveBeenCalledWith(
        "sample-1",
        "image-1"
      )
    );
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  test("offers mobile camera capture and library upload targets", () => {
    render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={images}
        sampleId="sample-1"
      />
    );

    const captureInput = screen.getByLabelText("Chụp ảnh mới");
    const libraryInput = screen.getByLabelText("Chọn ảnh từ thư viện");
    const deleteButton = screen.getByRole("button", { name: "Xóa ảnh" });

    expect(captureInput.getAttribute("capture")).toBe("environment");
    expect(libraryInput.hasAttribute("capture")).toBe(false);
    expect(screen.getByRole("button", { name: /Chụp ảnh/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Thư viện/ })).toBeTruthy();
    expect(deleteButton.className).toContain("size-9");
  });

  test("renders viewer images without upload or delete controls", () => {
    render(
      <SampleImagesPanel
        canWrite={false}
        initialImages={images}
        sampleId="sample-1"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Ảnh minh chứng" })
    ).toBeTruthy();
    expect(screen.getByText("image/png")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Chụp ảnh/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Thư viện/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Xóa ảnh" })).toBeNull();
  });

  test("uses compact spacing for dense viewer content", () => {
    const { container } = render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={images}
        sampleId="sample-1"
      />
    );

    const panel = container.querySelector("#sample-result-images");
    expect(panel?.className).toContain("p-3");
    expect(panel?.className).not.toContain("p-4");
    expect(container.innerHTML).toContain("justify-between gap-2");
    expect(container.innerHTML).toContain("mt-2");
    expect(container.innerHTML).toContain("mt-3 grid gap-2");
    expect(
      screen.getByRole("button", { name: /Chụp ảnh/ }).className
    ).toContain("h-9");
  });

  test("blocks upload when the sample already has ten images", async () => {
    const tenImages = Array.from({ length: 10 }, (_, index) => ({
      ...images[0],
      id: `image-${index + 1}`,
      publicId: `lab-management/org-1/sample-1/evidence-${index + 1}`,
    }));

    render(
      <SampleImagesPanel
        canWrite={true}
        initialImages={tenImages}
        sampleId="sample-1"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Chụp ảnh/ }));
    await userEvent.upload(
      screen.getByLabelText("Chụp ảnh mới") as HTMLInputElement,
      new File(["image"], "evidence.png", { type: "image/png" })
    );

    expect(uploadSampleImageRequest).not.toHaveBeenCalled();
    expect(
      screen.getByText("Mỗi mẫu chỉ được tối đa 10 ảnh minh chứng.")
    ).toBeTruthy();
  });
});
