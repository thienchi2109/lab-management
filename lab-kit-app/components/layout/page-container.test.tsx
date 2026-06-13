import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { PageContainer } from "./page-container";

describe("PageContainer", () => {
  test("renders the shared dashboard width constraints", () => {
    const html = renderToStaticMarkup(<PageContainer>Content</PageContainer>);

    expect(html).toContain("mx-auto");
    expect(html).toContain("w-full");
    expect(html).toContain("max-w-7xl");
  });

  test("allows pages to add local layout spacing", () => {
    const html = renderToStaticMarkup(
      <PageContainer className="gap-5">Content</PageContainer>
    );

    expect(html).toContain("gap-5");
  });
});
