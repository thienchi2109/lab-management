// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useActionState } from "react";
import { describe, expect, test, vi } from "vitest";

import { initialResultConfigurationActionState } from "../action-state";
import { CreateMetricDialog } from "./create-metric-dialog";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

vi.mock("../actions", () => ({
  createMetricAction: vi.fn(),
}));

const groups = [
  {
    id: "group-pcr",
    organizationId: "org-1",
    code: "PCR",
    name: "PCR",
    sortOrder: 10,
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z",
    metrics: [],
  },
];

describe("CreateMetricDialog", () => {
  test("keeps mobile actions visible and moves JSON fields behind an advanced tab", async () => {
    vi.mocked(useActionState).mockReturnValue([
      initialResultConfigurationActionState,
      vi.fn(),
      false,
    ]);

    const user = userEvent.setup();

    render(<CreateMetricDialog open groups={groups} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog").parentElement?.className).toContain(
      "z-[60]"
    );
    expect(screen.getByRole("tab", { name: "Cơ bản" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Nâng cao" })).toBeTruthy();
    expect(
      screen.getByLabelText("Tùy chọn JSON").closest("[hidden]")
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Tạo" }).parentElement?.className
    ).toContain("sticky bottom-0");

    await user.click(screen.getByRole("tab", { name: "Nâng cao" }));

    expect(
      screen.getByLabelText("Tùy chọn JSON").closest("[hidden]")
    ).toBeNull();
    expect(screen.getByLabelText("Thiết lập JSON")).toBeTruthy();
  });
});
