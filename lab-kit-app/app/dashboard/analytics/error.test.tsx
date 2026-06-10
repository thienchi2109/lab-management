// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import ErrorBoundary from "./error";

describe("AnalyticsPageError", () => {
  test("renders the analytics page error state and reset action", () => {
    const reset = vi.fn();

    render(
      <ErrorBoundary
        error={new Error("Không thể tải dữ liệu analytics.")}
        reset={reset}
      />
    );

    expect(screen.getByText("Không thể tải analytics")).toBeTruthy();
    expect(screen.getByText("Không thể tải dữ liệu analytics.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Tải lại" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
