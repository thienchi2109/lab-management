import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import Loading from "./loading";

describe("SampleGridLoading", () => {
  test("renders the sample grid loading state", () => {
    const html = renderToStaticMarkup(<Loading />);

    expect(html).toContain("Đang tải bảng mẫu xét nghiệm");
  });
});
