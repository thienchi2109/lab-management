// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AppToastProvider } from "@/components/ui/toast";
import { mapSampleMetadataRows } from "@/lib/sample-metadata/metadata";

import { SampleMetadataClient } from "./sample-metadata-client";

afterEach(cleanup);

const metadata = mapSampleMetadataRows({
  companies: [],
  customers: [],
  sampleTypes: [
    { id: "type-1", code: "PCR", name: "Mẫu PCR", is_active: true },
  ],
  kitBatches: [],
  samples: [],
});

const dialogAction = vi.fn(async () => ({
  status: "idle" as const,
  message: "",
}));

describe("SampleMetadataClient", () => {
  test("associates the search label with the search input control", () => {
    render(
      <AppToastProvider>
        <SampleMetadataClient
          metadata={metadata}
          actions={{ createSample: dialogAction, updateSample: dialogAction }}
        />
      </AppToastProvider>
    );

    const searchInput = screen.getByLabelText("Tìm kiếm");

    expect(searchInput).toBeInstanceOf(HTMLInputElement);
    expect((searchInput as HTMLInputElement).id).toBe("sample-search");
  });
});
