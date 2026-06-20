import { existsSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

const routeLoaders = [
  {
    file: "analytics/loading.tsx",
    modulePath: "./analytics/loading",
    text: "Đang tải báo cáo",
  },
  {
    file: "kits/loading.tsx",
    modulePath: "./kits/loading",
    text: "Đang tải kho KIT",
  },
  {
    file: "result-configuration/loading.tsx",
    modulePath: "./result-configuration/loading",
    text: "Đang tải cấu hình chỉ tiêu",
  },
  {
    file: "samples/loading.tsx",
    modulePath: "./samples/loading",
    text: "Đang tải bảng mẫu xét nghiệm",
  },
  {
    file: "users/loading.tsx",
    modulePath: "./users/loading",
    text: "Đang tải người dùng",
  },
];

describe("Dashboard loading routes", () => {
  test("cover every primary dashboard destination with recognizable loading copy", async () => {
    const missingRoutes = routeLoaders
      .filter((route) => !existsSync(join(__dirname, route.file)))
      .map((route) => route.file);

    expect(missingRoutes).toEqual([]);

    for (const route of routeLoaders) {
      const loadingModule = await import(route.modulePath);
      const html = renderToStaticMarkup(<loadingModule.default />);

      expect(html).toContain(route.text);
    }
  });
});
