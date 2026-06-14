// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sampleCreateRequestedEvent } from "@/components/layout/sample-create-action";
import { mapSampleMetadataRows } from "@/lib/sample-metadata/metadata";

import { SampleCreateOverlayBridge } from "./sample-create-overlay-bridge";

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

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal(
    this: HTMLDialogElement
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function close(
    this: HTMLDialogElement
  ) {
    this.removeAttribute("open");
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SampleCreateOverlayBridge", () => {
  test("opens the create sample modal when the global request event fires", async () => {
    render(
      <SampleCreateOverlayBridge
        metadata={metadata}
        formAction={dialogAction}
      />
    );

    expect(screen.queryByText("Tạo mẫu xét nghiệm")).toBeNull();

    window.dispatchEvent(new Event(sampleCreateRequestedEvent));

    await waitFor(() => {
      expect(screen.getByText("Tạo mẫu xét nghiệm")).toBeTruthy();
    });
    expect(screen.getByLabelText("Mã mẫu")).toBeTruthy();
  });
});
