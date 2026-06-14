// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { mapSampleMetadataRows } from "@/lib/sample-metadata/metadata";

import {
  CreateSampleDialog,
  EditSampleDialog,
} from "./sample-metadata-dialogs";

const metadata = mapSampleMetadataRows({
  companies: [
    { id: "company-1", code: "MP", name: "Công ty Minh Phú", is_active: true },
  ],
  customers: [
    {
      id: "customer-1",
      company_id: "company-1",
      code: "KH-001",
      name: "Nguyễn Văn A",
      phone: null,
      email: null,
      is_active: true,
    },
  ],
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
      customer_id: "customer-1",
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("sample metadata dialogs", () => {
  test("renders create sample with structured form sections", () => {
    render(
      <CreateSampleDialog
        open
        formAction={dialogAction}
        onClose={vi.fn()}
        {...metadata}
      />
    );

    expect(screen.getByText("Thông tin mẫu")).toBeTruthy();
    expect(screen.getByText("Ghi chú xử lý")).toBeTruthy();
    expect(screen.getByText("Tên khách hàng")).toBeTruthy();
    expect(screen.getByText("Ghi chú").className).toContain("sr-only");
    expect(screen.queryByText(/snapshot/i)).toBeNull();
    expect(document.body.innerHTML).toContain("bg-zinc-50");
  });

  test("renders edit sample as a right side sheet", () => {
    render(
      <EditSampleDialog
        sample={metadata.samples[0]}
        formAction={dialogAction}
        onClose={vi.fn()}
        {...metadata}
      />
    );

    expect(screen.getByText("Cập nhật T6_00012")).toBeTruthy();
    expect(screen.getByRole("dialog").className).toContain("right-0");
  });
});
