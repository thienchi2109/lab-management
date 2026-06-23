// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

import { KitInventoryClient } from "./kit-inventory-client";

const action = async () => ({ status: "idle" as const, message: "" });

const inventory = {
  summary: {
    totalKits: 1,
    inStockKits: 1,
    nearExpiryKits: 0,
    lowStockTypes: 0,
  },
  kitTypes: [
    {
      id: "type-1",
      code: "PCR_RT",
      name: "PCR Realtime",
      manufacturer: "BioLab",
      isActive: true,
    },
  ],
  batches: [
    {
      id: "batch-1",
      kitTypeId: "type-1",
      kitTypeName: "PCR Realtime",
      lotNumber: "LOT-01",
      receivedQuantity: 1,
      remainingQuantity: 1,
      expiresOn: "2026-12-31",
      receivedAt: "2026-06-05",
    },
  ],
  kits: [
    {
      id: "kit-1",
      kitCode: "KIT-001",
      status: "in_stock" as const,
      batchId: "batch-1",
      lotNumber: "LOT-01",
      kitTypeName: "PCR Realtime",
      expiresOn: "2026-12-31",
      updatedAt: "2026-06-05T00:00:00.000Z",
    },
  ],
};

const actions = {
  createKitType: action,
  createKitBatch: action,
  createKitUnits: action,
  updateKitStatus: action,
};

afterEach(() => {
  cleanup();
});

describe("KitInventoryClient mobile filters", () => {
  test("renders a compact mobile filter toolbar instead of inline controls", () => {
    const html = renderToStaticMarkup(
      <KitInventoryClient inventory={inventory} actions={actions} />
    );

    expect(html).toContain('data-mobile-kit-filter-toolbar="true"');
    expect(html).toContain("md:hidden");
    expect(html).toContain("Tìm mã KIT, lô hoặc loại KIT");
    expect(html).toContain("Bộ lọc");
    expect(html).toContain('data-kit-inventory-desktop-filters="true"');
    expect(html).toContain("hidden gap-3 md:grid");
  });

  test("opens a mobile bottom sheet with kit filter controls", async () => {
    const user = userEvent.setup();
    render(<KitInventoryClient inventory={inventory} actions={actions} />);

    await user.click(
      screen.getByRole("button", { name: "Tìm kiếm và lọc KIT" })
    );

    const sheet = screen.getByRole("dialog", { name: "Tìm kiếm và lọc KIT" });
    expect(sheet).toBeTruthy();
    expect(
      within(sheet).getByLabelText<HTMLInputElement>("Tìm kiếm").value
    ).toBe("");
    expect(within(sheet).getByText("Trạng thái")).toBeTruthy();
    expect(within(sheet).getByText("Loại KIT")).toBeTruthy();
    expect(within(sheet).getByRole("button", { name: "Xóa lọc" })).toBeTruthy();
    expect(within(sheet).getByRole("button", { name: "Áp dụng" })).toBeTruthy();
  });

  test("resets active mobile filters from the bottom sheet", async () => {
    const user = userEvent.setup();
    render(<KitInventoryClient inventory={inventory} actions={actions} />);

    await user.click(
      screen.getByRole("button", { name: "Tìm kiếm và lọc KIT" })
    );
    await user.type(
      within(screen.getByRole("dialog")).getByLabelText("Tìm kiếm"),
      "khong-co-kit"
    );
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Bộ lọc (1)")).toBeTruthy();
    expect(screen.getByText("Đang hiển thị 0/1 KIT")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Tìm kiếm và lọc KIT" })
    );
    await user.click(screen.getByRole("button", { name: "Xóa lọc" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Tìm mã KIT, lô hoặc loại KIT")).toBeTruthy();
    expect(screen.getByText("Bộ lọc")).toBeTruthy();
    expect(screen.getByText("Đang hiển thị 1/1 KIT")).toBeTruthy();
  });
});
