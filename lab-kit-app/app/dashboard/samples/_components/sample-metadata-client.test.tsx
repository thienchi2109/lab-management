import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("SampleMetadataClient", () => {
  test("associates the search label with the search input control", async () => {
    const source = await readFile(
      new URL("./sample-metadata-client.tsx", import.meta.url),
      "utf8"
    );

    expect(source).toContain('htmlFor="sample-search"');
    expect(source).toContain('id="sample-search"');
  });
});
