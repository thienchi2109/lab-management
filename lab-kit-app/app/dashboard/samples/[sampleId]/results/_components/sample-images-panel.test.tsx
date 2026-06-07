import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { SampleImagesPanel } from "./sample-images-panel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

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
  test("renders existing evidence images and upload controls for editors", () => {
    const html = renderToStaticMarkup(
      <SampleImagesPanel
        canWrite={true}
        initialImages={images}
        sampleId="sample-1"
      />
    );

    expect(html).toContain("Ảnh minh chứng");
    expect(html).toContain("Tải ảnh");
    expect(html).toContain('type="file"');
    expect(html).toContain("image/png");
    expect(html).toContain("Xóa ảnh");
  });

  test("renders viewer images without upload or delete controls", () => {
    const html = renderToStaticMarkup(
      <SampleImagesPanel
        canWrite={false}
        initialImages={images}
        sampleId="sample-1"
      />
    );

    expect(html).toContain("Ảnh minh chứng");
    expect(html).toContain("image/png");
    expect(html).not.toContain("Tải ảnh");
    expect(html).not.toContain("Xóa ảnh");
  });
});
