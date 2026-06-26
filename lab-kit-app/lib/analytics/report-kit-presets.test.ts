import { describe, expect, expectTypeOf, test } from "vitest";

import type { AnalyticsActor } from "./operations";
import {
  canSaveReportKitFilterPreset,
  mergeReportKitDefaultFilters,
  parseReportKitFilterPresetConfig,
  type ReportKitFilterPreset,
} from "./report-kit-presets";

const adminActor = createActor("admin");
const editorActor = createActor("editor");
const viewerActor = createActor("viewer");

describe("report kit filter presets", () => {
  test("parses chart filter preset payloads and rejects unknown charts or filters", () => {
    expect(
      parseReportKitFilterPresetConfig({
        charts: {
          kitQuantityBySampleType: {
            filters: {
              receivedFrom: "2026-06-01",
              receivedTo: "2026-06-08",
              sampleTypeId: "sample-type-1",
            },
          },
        },
      })
    ).toEqual({
      charts: {
        kitQuantityBySampleType: {
          filters: {
            receivedFrom: "2026-06-01",
            receivedTo: "2026-06-08",
            sampleTypeId: "sample-type-1",
          },
        },
      },
    });

    expect(() =>
      parseReportKitFilterPresetConfig({
        charts: {
          rawSql: { filters: { receivedFrom: "2026-06-01" } },
        },
      })
    ).toThrow("Preset bộ lọc báo cáo không hợp lệ.");

    expect(() =>
      parseReportKitFilterPresetConfig({
        charts: {
          kitQuantityBySampleType: {
            filters: { customerName: "Công ty bí mật" },
          },
        },
      })
    ).toThrow("Preset bộ lọc báo cáo không hợp lệ.");
  });

  test("allows only Admin to persist organization report presets", () => {
    expect(canSaveReportKitFilterPreset(adminActor)).toBe(true);
    expect(canSaveReportKitFilterPreset(editorActor)).toBe(false);
    expect(canSaveReportKitFilterPreset(viewerActor)).toBe(false);
  });

  test("merges saved chart filters over the default bounded date filters", () => {
    const filtersByChart = mergeReportKitDefaultFilters(
      { receivedFrom: "2026-06-01", receivedTo: "2026-06-30" },
      {
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-10", sampleTypeId: "pl" },
          },
          kitQuantityByKitType: {
            filters: { kitTypeId: "kit-a" },
          },
        },
      }
    );

    expect(filtersByChart.kitQuantityBySampleType).toEqual({
      receivedFrom: "2026-06-10",
      receivedTo: "2026-06-30",
      sampleTypeId: "pl",
    });
    expect(filtersByChart.kitQuantityByKitType).toEqual({
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-30",
      kitTypeId: "kit-a",
    });
    expect(filtersByChart.sampleCountByClassification).toEqual({
      receivedFrom: "2026-06-01",
      receivedTo: "2026-06-30",
    });
  });

  test("allows nullable updater metadata from deleted profiles", () => {
    expectTypeOf<ReportKitFilterPreset["updatedBy"]>().toEqualTypeOf<
      string | null
    >();
  });
});

function createActor(role: AnalyticsActor["role"]): AnalyticsActor {
  return {
    organizationId: "org-1",
    profileId: `profile-${role}`,
    role,
  };
}
