"use client";

import { useMemo, useReducer } from "react";
import { ClipboardList, Search, SlidersHorizontal } from "lucide-react";

import { DashboardDataTable } from "@/components/dashboard/data-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  SampleMetadata,
  SampleMetadataRow,
} from "@/lib/sample-metadata/metadata";
import {
  isSampleBillingStatus,
  isSampleStatus,
  type SampleBillingStatus,
  type SampleStatus,
} from "@/lib/sample-metadata/schemas";

import {
  CreateSampleDialog,
  EditSampleDialog,
} from "./sample-metadata-dialogs";
import type { SampleMetadataDialogAction } from "./sample-metadata-dialog-state";
import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

type SampleMetadataClientProps = {
  metadata: SampleMetadata;
  actions: {
    createSample: SampleMetadataDialogAction;
    updateSample: SampleMetadataDialogAction;
  };
};

/** Render the interactive sample metadata dashboard surface. */
export function SampleMetadataClient({
  metadata,
  actions,
}: SampleMetadataClientProps) {
  const [state, dispatch] = useReducer(sampleMetadataReducer, initialState);
  const filteredSamples = useMemo(() => {
    return metadata.samples.filter((sample) => matchesFilters(sample, state));
  }, [metadata.samples, state]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Quản lý mẫu xét nghiệm
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tạo, lọc và cập nhật metadata mẫu trước khi nhập kết quả xét nghiệm.
          </p>
        </div>
        <Button type="button" onClick={() => dispatch({ type: "openCreate" })}>
          <ClipboardList className="size-4" />
          Tạo mẫu
        </Button>
      </div>

      <SummaryStrip metadata={metadata} />
      <FilterPanel metadata={metadata} state={state} dispatch={dispatch} />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="size-4" />
        Đang hiển thị {filteredSamples.length}/{metadata.samples.length} mẫu
      </div>

      <DashboardDataTable
        caption="Danh sách mẫu xét nghiệm"
        emptyTitle="Không có mẫu phù hợp"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        rows={filteredSamples.map((sample) => ({
          id: sample.id,
          cells: [
            { header: "Mã mẫu", content: sample.sampleCode, primary: true },
            { header: "Khách hàng", content: sample.customerName },
            { header: "Công ty", content: sample.companyName ?? "Không có" },
            { header: "Loại mẫu", content: sample.sampleTypeName },
            { header: "Ngày nhận", content: formatDate(sample.receivedAt) },
            { header: "Trạng thái", content: <StatusBadge sample={sample} /> },
            {
              header: "Thanh toán",
              content: billingStatusLabels[sample.billingStatus],
            },
          ],
          actions: (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "openEdit", sample })}
            >
              Cập nhật
            </Button>
          ),
        }))}
      />

      <CreateSampleDialog
        open={state.creating}
        formAction={actions.createSample}
        onClose={() => dispatch({ type: "closeDialog" })}
        {...metadata}
      />
      <EditSampleDialog
        sample={state.editing}
        formAction={actions.updateSample}
        onClose={() => dispatch({ type: "closeDialog" })}
        {...metadata}
      />
    </div>
  );
}

function SummaryStrip({ metadata }: { metadata: SampleMetadata }) {
  const items = [
    ["Tổng mẫu", metadata.summary.totalSamples],
    ["Đã nhận", metadata.summary.receivedSamples],
    ["Đang xử lý", metadata.summary.inProgressSamples],
    ["Chưa thu", metadata.summary.unpaidSamples],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border bg-background p-4">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}

function FilterPanel({
  metadata,
  state,
  dispatch,
}: {
  metadata: SampleMetadata;
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_160px_180px_180px]">
        <label className="space-y-1.5 text-sm font-medium">
          <span>Tìm kiếm</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={state.search}
              onChange={(event) =>
                dispatch({ type: "setSearch", value: event.target.value })
              }
              className="pl-8"
              placeholder="Mã mẫu, khách hàng hoặc công ty"
            />
          </div>
        </label>
        <FilterSelect
          label="Trạng thái"
          value={state.status}
          onChange={(value) => dispatch({ type: "setStatus", value })}
          options={[["all", "Tất cả"], ...Object.entries(sampleStatusLabels)]}
        />
        <FilterSelect
          label="Loại mẫu"
          value={state.sampleTypeId}
          onChange={(value) => dispatch({ type: "setSampleType", value })}
          options={[["all", "Tất cả"], ...metadata.filterOptions.sampleTypes]}
        />
        <FilterSelect
          label="Thanh toán"
          value={state.billingStatus}
          onChange={(value) => dispatch({ type: "setBilling", value })}
          options={[
            ["all", "Tất cả"],
            ...metadata.filterOptions.billingStatuses,
          ]}
        />
      </div>
    </section>
  );
}

function StatusBadge({ sample }: { sample: SampleMetadataRow }) {
  const destructive = sample.status === "archived";

  return (
    <Badge variant={destructive ? "destructive" : "secondary"}>
      {sampleStatusLabels[sample.status]}
    </Badge>
  );
}

type State = {
  search: string;
  status: "all" | SampleStatus;
  sampleTypeId: string;
  billingStatus: "all" | SampleBillingStatus;
  creating: boolean;
  editing: SampleMetadataRow | null;
};

type Action =
  | { type: "setSearch"; value: string }
  | { type: "setStatus"; value: string }
  | { type: "setSampleType"; value: string }
  | { type: "setBilling"; value: string }
  | { type: "openCreate" }
  | { type: "openEdit"; sample: SampleMetadataRow }
  | { type: "closeDialog" };

const initialState: State = {
  search: "",
  status: "all",
  sampleTypeId: "all",
  billingStatus: "all",
  creating: false,
  editing: null,
};

function sampleMetadataReducer(state: State, action: Action): State {
  switch (action.type) {
    case "setSearch":
      return { ...state, search: action.value };
    case "setStatus":
      return {
        ...state,
        status:
          action.value === "all" || isSampleStatus(action.value)
            ? action.value
            : state.status,
      };
    case "setSampleType":
      return { ...state, sampleTypeId: action.value };
    case "setBilling":
      return {
        ...state,
        billingStatus:
          action.value === "all" || isSampleBillingStatus(action.value)
            ? action.value
            : state.billingStatus,
      };
    case "openCreate":
      return { ...state, creating: true };
    case "openEdit":
      return { ...state, editing: action.sample };
    case "closeDialog":
      return { ...state, creating: false, editing: null };
  }
}

function matchesFilters(sample: SampleMetadataRow, state: State) {
  const search = state.search.trim().toLowerCase();
  const matchesSearch =
    search.length === 0 ||
    sample.sampleCode.toLowerCase().includes(search) ||
    sample.customerName.toLowerCase().includes(search) ||
    (sample.companyName?.toLowerCase().includes(search) ?? false);

  return (
    matchesSearch &&
    (state.status === "all" || sample.status === state.status) &&
    (state.sampleTypeId === "all" ||
      sample.sampleTypeId === state.sampleTypeId) &&
    (state.billingStatus === "all" ||
      sample.billingStatus === state.billingStatus)
  );
}

function formatDate(value: string) {
  return sampleDateFormatter.format(new Date(value));
}
