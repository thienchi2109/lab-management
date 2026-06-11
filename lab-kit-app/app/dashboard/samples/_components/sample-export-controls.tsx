"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ExportFormat } from "@/lib/export/query";
import type { SampleGridQuery } from "@/lib/sample-grid/query";

import {
  requestSampleGridExport,
  SAMPLE_GRID_EXPORT_ROW_LIMIT,
  type SampleGridExportDataset,
  type SampleGridExportState,
} from "./sample-export-request";

type SampleExportControlsProps = {
  canExport: boolean;
  query: SampleGridQuery;
};

type UiState =
  | { status: "idle"; message: "" }
  | { status: "pending"; message: string }
  | SampleGridExportState;

const formatOptions: ExportFormat[] = ["csv", "xlsx"];

/** Render controls tải CSV/XLSX cho bảng mẫu theo URL state hiện hành. */
export function SampleExportControls({
  canExport,
  query,
}: SampleExportControlsProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [state, setState] = useState<UiState>({
    status: "idle",
    message: "",
  });
  const isPending = state.status === "pending";
  const disabled = isPending || !canExport;

  async function handleExport(dataset: SampleGridExportDataset) {
    if (!canExport) {
      setState({
        status: "error",
        message: "Bạn không có quyền export dữ liệu từ tài khoản này.",
      });
      return;
    }

    setState({ status: "pending", message: "Đang tạo file export..." });
    const result = await requestSampleGridExport({
      dataset,
      format,
      query,
      rowLimit: SAMPLE_GRID_EXPORT_ROW_LIMIT,
    });
    setState(result.state);
  }

  return (
    <section
      aria-label="Export dữ liệu"
      className="flex w-full flex-col gap-2 rounded-lg border bg-background p-3 text-sm md:w-auto md:min-w-80"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">Export dữ liệu</span>
        <fieldset className="flex rounded-lg border bg-muted/30 p-0.5">
          <legend className="sr-only">Định dạng export</legend>
          {formatOptions.map((option) => (
            <Button
              key={option}
              aria-pressed={format === option}
              onClick={() => setFormat(option)}
              size="sm"
              type="button"
              variant={format === option ? "default" : "ghost"}
            >
              {option.toUpperCase()}
            </Button>
          ))}
        </fieldset>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled}
          onClick={() => void handleExport("samples")}
          size="sm"
          type="button"
          variant="outline"
        >
          <Download data-icon="inline-start" />
          Export mẫu
        </Button>
        <Button
          disabled={disabled}
          onClick={() => void handleExport("results-normalized")}
          size="sm"
          type="button"
          variant="outline"
        >
          <Download data-icon="inline-start" />
          Export kết quả
        </Button>
      </div>
      {!canExport ? (
        <p className="text-sm font-medium text-destructive">
          Bạn không có quyền export dữ liệu từ tài khoản này.
        </p>
      ) : null}
      {state.status !== "idle" ? (
        <p
          aria-live="polite"
          className={
            state.status === "success"
              ? "text-sm font-medium text-emerald-600"
              : state.status === "pending"
                ? "text-sm font-medium text-muted-foreground"
                : "text-sm font-medium text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
