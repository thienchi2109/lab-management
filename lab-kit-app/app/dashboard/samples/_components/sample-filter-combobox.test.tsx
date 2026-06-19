// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { SampleFilterCombobox } from "./sample-filter-combobox";

describe("SampleFilterCombobox", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("keeps the visible filter input aligned with neighboring controls", () => {
    render(
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

    const field = screen.getByText("Khách hàng").closest("label");
    const className = field?.getAttribute("class") ?? "";

    expect(className).toContain("flex");
    expect(className).toContain("flex-col");
    expect(className).toContain("gap-1.5");
    expect(className).not.toContain("space-y-1.5");
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

  test("debounces visible suggestions while allowing text-only options", () => {
    vi.useFakeTimers();
    const { container } = render(
      <SampleFilterCombobox
        idName="customerId"
        inputId="customer-filter"
        label="Khách hàng"
        listId="customer-options"
        options={[
          { id: "", label: "Khách hàng Minh Phú" },
          { id: "", label: "Khách hàng Cửu Long" },
        ]}
        placeholder="Tất cả khách hàng"
        textName="customerName"
      />
    );
    const input = screen.getByRole("combobox", { name: "Khách hàng" });
    const optionValues = () =>
      Array.from(container.querySelectorAll("datalist option")).map((option) =>
        option.getAttribute("value")
      );

    fireEvent.change(input, { target: { value: "Minh" } });

    expect(optionValues()).toEqual([
      "Khách hàng Minh Phú",
      "Khách hàng Cửu Long",
    ]);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(optionValues()).toEqual(["Khách hàng Minh Phú"]);
  });

  test("does not infer an ID when duplicate option labels are ambiguous", () => {
    vi.useFakeTimers();
    const { container } = render(
      <SampleFilterCombobox
        idName="customerId"
        inputId="customer-filter"
        label="Khách hàng"
        listId="customer-options"
        options={[
          { id: "customer-1", label: "Nguyễn Văn A" },
          { id: "customer-2", label: "Nguyễn Văn A" },
        ]}
        placeholder="Tất cả khách hàng"
        textName="customerName"
      />
    );
    const hiddenId = container.querySelector<HTMLInputElement>(
      'input[name="customerId"]'
    );
    const input = screen.getByRole("combobox", { name: "Khách hàng" });

    fireEvent.change(input, { target: { value: "Nguyễn Văn A" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(input).toHaveProperty("value", "Nguyễn Văn A");
    expect(hiddenId?.value).toBe("");
  });
});
