import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

describe("export audit server boundary", () => {
  test("marks the audit writer module as server-only", async () => {
    const source = await readFile(new URL("./audit.ts", import.meta.url), {
      encoding: "utf8",
    });

    expect(source.startsWith('import "server-only";')).toBe(true);
  });
});
