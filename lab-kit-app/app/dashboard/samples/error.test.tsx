// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import ErrorBoundary from "./error";

describe("SampleGridError", () => {
  test("renders the sample grid error state", () => {
    render(
      <ErrorBoundary
        error={new Error("Không thể tải bảng mẫu xét nghiệm.")}
        reset={vi.fn()}
      />
    );

    expect(screen.getByText("Không thể tải bảng mẫu xét nghiệm")).toBeTruthy();
  });
});
