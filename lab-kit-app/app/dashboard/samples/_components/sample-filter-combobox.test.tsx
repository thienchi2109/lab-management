// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { SampleFilterCombobox } from "./sample-filter-combobox";

describe("SampleFilterCombobox", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("debounces option ID matching by 300ms while keeping free text editable", async () => {
    vi.useFakeTimers();
    const { container } = render(
      <SampleFilterCombobox
        idName="customerId"
        inputId="customer-filter"
        label="Khách hàng"
        listId="customer-options"
        options={[{ id: "customer-1", label: "Nguyễn Văn A" }]}
        placeholder="Tất cả khách hàng"
        textName="customerName"
      />
    );
    const hiddenId = container.querySelector<HTMLInputElement>(
      'input[name="customerId"]'
    );
    const input = screen.getByRole("combobox", { name: "Khách hàng" });

    expect(hiddenId?.value).toBe("");

    fireEvent.change(input, { target: { value: "Nguyễn Văn A" } });

    expect(input).toHaveProperty("value", "Nguyễn Văn A");
    expect(hiddenId?.value).toBe("");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(hiddenId?.value).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(hiddenId?.value).toBe("customer-1");
  });
});
