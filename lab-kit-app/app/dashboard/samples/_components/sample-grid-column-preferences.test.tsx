// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

import {
  SampleGridColumnPreferences,
  useSampleGridHiddenColumnKeys,
} from "./sample-grid-column-preferences";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.body.innerHTML = "";
});

const columns = [
  { key: "sample", label: "Mã mẫu", locked: true },
  { key: "kit", label: "KIT" },
];

const source = readFileSync(
  join(
    process.cwd(),
    "app/dashboard/samples/_components/sample-grid-column-preferences.tsx"
  ),
  "utf8"
);

describe("SampleGridColumnPreferences", () => {
  test("uses the shared Checkbox component for column toggles", () => {
    expect(source).toContain('from "@/components/ui/checkbox"');
    expect(source).not.toContain('type="checkbox"');
    expect(source).toContain("checked === true");
  });

  test("restores hidden column state from localStorage and persists toggles", async () => {
    localStorage.setItem("sample-grid-test-columns", JSON.stringify(["kit"]));

    render(<ColumnPreferenceHarness storageKey="sample-grid-test-columns" />);

    const kitToggle = screen.getByRole("checkbox", {
      name: "Hiển thị KIT",
    });

    await screen.findByText("Ẩn: kit");
    expect(kitToggle.getAttribute("aria-checked")).toBe("false");

    await userEvent.click(kitToggle);

    await screen.findByText("Ẩn: none");
    expect(kitToggle.getAttribute("aria-checked")).toBe("true");
    expect(localStorage.getItem("sample-grid-test-columns")).toBe("[]");
  });

  test("does not mutate grid DOM nodes directly", async () => {
    localStorage.setItem("sample-grid-test-columns", JSON.stringify(["kit"]));
    document.body.innerHTML =
      '<div data-sample-column-key="kit">PCR Realtime - LOT-01</div>';

    render(
      <SampleGridColumnPreferences
        columns={columns}
        storageKey="sample-grid-test-columns"
      />
    );

    const kitColumn = document.querySelector<HTMLElement>(
      '[data-sample-column-key="kit"]'
    );
    const kitToggle = screen.getByRole("checkbox", {
      name: "Hiển thị KIT",
    });

    await waitFor(() =>
      expect(kitToggle.getAttribute("aria-checked")).toBe("false")
    );
    expect(kitColumn?.hidden).toBe(false);
  });

  test("syncs persisted hidden columns after hydration", async () => {
    const storageKey = "sample-grid-test-columns";
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("server render has no browser storage");
    };

    const serverMarkup = renderToString(
      <ColumnPreferenceHarness storageKey={storageKey} />
    );

    Storage.prototype.getItem = originalGetItem;
    localStorage.setItem(storageKey, JSON.stringify(["kit"]));
    document.body.innerHTML = `<div id="root">${serverMarkup}</div><div data-sample-column-key="kit">PCR Realtime - LOT-01</div>`;

    const container = document.getElementById("root");
    if (!container) throw new Error("missing hydration root");

    const root = hydrateRoot(
      container,
      <ColumnPreferenceHarness storageKey={storageKey} />
    );

    const kitToggle = screen.getByRole("checkbox", {
      name: "Hiển thị KIT",
    });

    await screen.findByText("Ẩn: kit");
    await waitFor(() =>
      expect(kitToggle.getAttribute("aria-checked")).toBe("false")
    );

    await act(async () => {
      root.unmount();
    });
  });
});

function ColumnPreferenceHarness({ storageKey }: { storageKey: string }) {
  const hiddenKeys = useSampleGridHiddenColumnKeys(columns, storageKey);

  return (
    <>
      <SampleGridColumnPreferences columns={columns} storageKey={storageKey} />
      <output>Ẩn: {hiddenKeys.join(", ") || "none"}</output>
    </>
  );
}
