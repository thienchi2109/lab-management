// @vitest-environment jsdom

import type React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AppToastProvider } from "@/components/ui/toast";
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

function renderWithToast(ui: React.ReactElement) {
  return render(<AppToastProvider>{ui}</AppToastProvider>);
}

describe("sample metadata dialogs", () => {
  test("renders create sample with structured form sections", () => {
    renderWithToast(
      <CreateSampleDialog
        open
        formAction={dialogAction}
        onClose={vi.fn()}
        {...metadata}
      />
    );

    expect(screen.getByText("Thông tin mẫu")).toBeTruthy();
    expect(screen.getByText("Ghi chú xử lý")).toBeTruthy();
    expect(screen.getByText("Mã mẫu")).toBeTruthy();
    expect(screen.getByText("HP-YYMMDD-••••••••")).toBeTruthy();
    expect(screen.getByText("Tên khách hàng")).toBeTruthy();
    expect(screen.queryByLabelText("Mã mẫu")).toBeNull();
    expect(screen.getByText("Ghi chú").className).toContain("sr-only");
    expect(screen.getByLabelText("Ngày lấy mẫu").getAttribute("type")).toBe(
      "date"
    );
    expect(screen.getByLabelText("Ngày nhận").getAttribute("type")).toBe(
      "date"
    );
    expect(screen.queryByText(/snapshot/i)).toBeNull();
    expect(document.body.innerHTML).toContain("bg-card");
    expect(document.body.innerHTML).toContain("text-card-foreground");
    expect(document.body.innerHTML).not.toContain("bg-zinc-50");
    expect(document.body.innerHTML).not.toContain("bg-white");
    expect(document.body.innerHTML).not.toContain("border-zinc");
    expect(document.body.innerHTML).not.toContain("text-zinc");
  });

  test("renders edit sample as a right side sheet", () => {
    renderWithToast(
      <EditSampleDialog
        sample={metadata.samples[0]}
        formAction={dialogAction}
        onClose={vi.fn()}
        {...metadata}
      />
    );

    expect(screen.getByText("Cập nhật T6_00012")).toBeTruthy();
    expect(screen.queryByLabelText("Mã mẫu")).toBeNull();
    expect(screen.getByRole("dialog").className).toContain("right-0");
  });

  test("shows the generated sample code in a success toast after submit", async () => {
    const formAction = vi.fn(async () => ({
      status: "success" as const,
      message: "Đã tạo mẫu xét nghiệm. Mã mẫu: HP-260615-7K3QM2XH.",
    }));

    renderWithToast(
      <CreateSampleDialog
        open
        formAction={formAction}
        onClose={vi.fn()}
        {...metadata}
      />
    );

    fireEvent.submit(screen.getByText("Tạo mẫu").closest("form")!);

    await waitFor(() => {
      expect(
        document.querySelector("[data-slot='toast-description']")?.textContent
      ).toBe("Đã tạo mẫu xét nghiệm. Mã mẫu: HP-260615-7K3QM2XH.");
    });
  });
});
