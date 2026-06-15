// @vitest-environment jsdom

import type React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sampleCreateRequestedEvent } from "@/components/layout/sample-create-action";
import { AppToastProvider } from "@/components/ui/toast";
import { mapSampleMetadataRows } from "@/lib/sample-metadata/metadata";

import { SampleCreateOverlayBridge } from "./sample-create-overlay-bridge";

const metadata = mapSampleMetadataRows({
  companies: [
    { id: "company-1", code: "MP", name: "Công ty Minh Phú", is_active: true },
  ],
  customers: [],
  sampleTypes: [
    { id: "type-1", code: "PCR", name: "Mẫu PCR", is_active: true },
  ],
  kitBatches: [
    { id: "batch-1", kit_type_name: "PCR Realtime", lot_number: "LOT-01" },
  ],
  samples: [
    {
      id: "sample-1",
      sample_type_id: "type-1",
      customer_id: null,
      company_id: "company-1",
      kit_batch_id: "batch-1",
      sample_code: "T6_00012",
      customer_name: "Nguyễn Văn A",
      collected_at: null,
      received_at: "2026-06-06T08:30:00.000Z",
      status: "received",
      billing_status: "unpaid",
      metadata: { note: "Ưu tiên" },
      updated_at: "2026-06-06T09:00:00.000Z",
    },
  ],
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

function renderWithToast(ui: React.ReactElement) {
  return render(<AppToastProvider>{ui}</AppToastProvider>);
}

describe("SampleCreateOverlayBridge", () => {
  test("opens the create sample modal when the global request event fires", async () => {
    renderWithToast(
      <SampleCreateOverlayBridge
        metadata={metadata}
        formAction={dialogAction}
        updateAction={dialogAction}
      />
    );

    expect(screen.queryByText("Tạo mẫu xét nghiệm")).toBeNull();

    window.dispatchEvent(new Event(sampleCreateRequestedEvent));

    await waitFor(() => {
      expect(screen.getByText("Tạo mẫu xét nghiệm")).toBeTruthy();
    });
    expect(screen.queryByLabelText("Mã mẫu")).toBeNull();
  });

  test("opens a read-only sample side sheet from the global view event", async () => {
    renderWithToast(
      <SampleCreateOverlayBridge
        metadata={metadata}
        formAction={dialogAction}
        updateAction={dialogAction}
      />
    );

    window.dispatchEvent(
      new CustomEvent("lab:samples:view-requested", {
        detail: { sampleId: "sample-1" },
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Mẫu T6_00012")).toBeTruthy();
    });
    expect(screen.getByRole("dialog").className).toContain("right-0");
    expect(screen.getByText("Ưu tiên")).toBeTruthy();
    expect(screen.queryByText("Cập nhật")).toBeNull();
  });

  test("opens a side sheet from event sample data when layout metadata is stale", async () => {
    renderWithToast(
      <SampleCreateOverlayBridge
        metadata={{ ...metadata, samples: [] }}
        formAction={dialogAction}
        updateAction={dialogAction}
      />
    );

    window.dispatchEvent(
      new CustomEvent("lab:samples:view-requested", {
        detail: { sampleId: "sample-1", sample: metadata.samples[0] },
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Mẫu T6_00012")).toBeTruthy();
    });
    expect(screen.getByRole("dialog").className).toContain("right-0");
  });

  test("normalizes row sample data before metadata side sheet events", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "app/dashboard/samples/_components/sample-grid-table-section.tsx"
      ),
      "utf8"
    );

    expect(source).toContain(
      "requestSampleMetadataView(toMetadataRequestSample(sample))"
    );
    expect(source).toContain(
      "requestSampleMetadataEdit(toMetadataRequestSample(sample))"
    );
  });

  test("opens the edit sample side sheet from the global edit event", async () => {
    renderWithToast(
      <SampleCreateOverlayBridge
        metadata={metadata}
        formAction={dialogAction}
        updateAction={dialogAction}
      />
    );

    window.dispatchEvent(
      new CustomEvent("lab:samples:edit-requested", {
        detail: { sampleId: "sample-1" },
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Cập nhật T6_00012")).toBeTruthy();
    });
    expect(screen.getByRole("dialog").className).toContain("right-0");
    expect(screen.queryByLabelText("Mã mẫu")).toBeNull();
  });

  test("wires the edit sample sheet to the update action", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "app/dashboard/samples/_components/sample-create-overlay-bridge.tsx"
      ),
      "utf8"
    );

    expect(source).toContain("updateAction");
    expect(source).toContain("formAction={updateAction}");
  });
});
