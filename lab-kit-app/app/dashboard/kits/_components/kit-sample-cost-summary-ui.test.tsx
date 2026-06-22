// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

import type { SampleCostSummary } from "@/lib/sample-metadata/sample-cost-summary";

import { KitInventoryClient } from "./kit-inventory-client";

const action = async () => ({ status: "idle" as const, message: "" });

afterEach(() => {
  cleanup();
});

describe("KitInventoryClient sample cost summary", () => {
  beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => undefined;
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => undefined;
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => undefined;
    }
  });

  test("renders the contracted cost totals and filters by cost status", async () => {
    const user = userEvent.setup();

    render(
      <KitInventoryClient
        inventory={emptyInventory}
        sampleCostSummary={summary}
        actions={actions}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Chi phí hiện tại" })
    ).toBeTruthy();
    expect(screen.getByText("Tiền mặt thu được")).toBeTruthy();
    expect(screen.getByText("120.000 ₫")).toBeTruthy();
    expect(screen.getByText("Nhận chuyển khoản")).toBeTruthy();
    expect(screen.getByText("340.000 ₫")).toBeTruthy();
    expect(screen.getByText("Ghi hóa đơn")).toBeTruthy();
    expect(screen.getByText("560.000 ₫")).toBeTruthy();
    expect(screen.getByText("Khác")).toBeTruthy();
    expect(screen.getByText("0 ₫")).toBeTruthy();
    expect(screen.queryByText("NaN")).toBeNull();
    expect(screen.queryByText("null")).toBeNull();
    expect(screen.queryByText("-5.000 ₫")).toBeNull();

    await user.click(
      screen.getByRole("combobox", { name: "Tình trạng chi phí" })
    );
    await user.click(screen.getByRole("option", { name: "Ghi hóa đơn" }));

    expect(screen.getByText("560.000 ₫")).toBeTruthy();
    expect(screen.queryByText("120.000 ₫")).toBeNull();
    expect(screen.queryByText("340.000 ₫")).toBeNull();
  });

  test("renders a clear empty state when no sample has cost", () => {
    render(
      <KitInventoryClient
        inventory={emptyInventory}
        sampleCostSummary={emptySummary}
        actions={actions}
      />
    );

    expect(screen.getByText("Chưa có mẫu có chi phí")).toBeTruthy();
    expect(
      screen.getByText(
        "Các tổng chi phí sẽ hiển thị khi mẫu có số tiền hợp lệ."
      )
    ).toBeTruthy();
  });
});

const actions = {
  createKitType: action,
  createKitBatch: action,
  createKitUnits: action,
  updateKitStatus: action,
};

const emptyInventory = {
  summary: {
    totalKits: 0,
    inStockKits: 0,
    nearExpiryKits: 0,
    lowStockTypes: 0,
  },
  kitTypes: [],
  batches: [],
  kits: [],
};

const summary: SampleCostSummary = {
  groups: [
    { group: "cash", label: "Tiền mặt thu được", totalAmountVnd: 120000 },
    {
      group: "bank_transfer",
      label: "Nhận chuyển khoản",
      totalAmountVnd: 340000,
    },
    { group: "invoice", label: "Ghi hóa đơn", totalAmountVnd: 560000 },
    { group: "other", label: "Khác", totalAmountVnd: -5000 },
  ],
};

const emptySummary: SampleCostSummary = {
  groups: summary.groups.map((group) => ({ ...group, totalAmountVnd: 0 })),
};
