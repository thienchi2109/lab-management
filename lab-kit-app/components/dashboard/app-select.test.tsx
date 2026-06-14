// @vitest-environment jsdom

import { readFile } from "node:fs/promises";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { AppSelect } from "./app-select";

afterEach(cleanup);

describe("AppSelect", () => {
  test("supports an explicit empty option without breaking Radix Select", () => {
    render(
      <AppSelect
        label="Khách hàng"
        name="customerId"
        defaultValue=""
        options={[
          { value: "", label: "Không chọn" },
          { value: "customer-1", label: "Nguyễn Văn A" },
        ]}
      />
    );

    expect(screen.getByText("Không chọn")).toBeTruthy();
    const input = document.querySelector('input[name="customerId"]');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).value).toBe("");
  });

  test("uses popper dropdown positioning so modal scroll does not shift", async () => {
    const source = await readFile("components/dashboard/app-select.tsx", {
      encoding: "utf8",
    });

    expect(source).toContain('position="popper"');
    expect(source).toContain('align="start"');
    expect(source).toContain("max-h-72");
  });
});
