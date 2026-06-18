// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { sampleResultViewRequestedEvent } from "@/components/layout/sample-create-action";

import { SampleResultViewerLink } from "./sample-result-viewer-link";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SampleResultViewerLink", () => {
  test("keeps modified clicks on the deep-link href instead of opening the overlay", async () => {
    const events: CustomEvent[] = [];
    window.addEventListener(sampleResultViewRequestedEvent, (event) => {
      events.push(event as CustomEvent);
    });
    let defaultPreventedAtWindow: boolean | null = null;
    window.addEventListener(
      "click",
      (event) => {
        defaultPreventedAtWindow = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true }
    );

    render(
      <SampleResultViewerLink sampleId="sample-1">
        Xem kết quả
      </SampleResultViewerLink>
    );

    const link = screen.getByRole("link", { name: "Xem kết quả" });
    const click = new MouseEvent("click", {
      bubbles: true,
      button: 0,
      cancelable: true,
      ctrlKey: true,
    });
    link.dispatchEvent(click);

    expect(events).toHaveLength(0);
    expect(defaultPreventedAtWindow).toBe(false);
    expect(link.getAttribute("href")).toBe(
      "/dashboard/samples/sample-1/results"
    );
  });
});
