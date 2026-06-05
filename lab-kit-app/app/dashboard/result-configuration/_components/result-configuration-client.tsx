"use client";

import { useMemo, useReducer } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { FilterSelect } from "@/components/dashboard/filter-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ResultConfiguration,
  ResultConfigurationSummary,
} from "@/lib/result-configuration/configuration";
import { filterResultConfiguration } from "@/lib/result-configuration/configuration";

import {
  CreateGroupDialog,
  CreateMetricDialog,
  CreateTemplateDialog,
} from "./result-configuration-dialogs";
import { ResultConfigurationLists } from "./result-configuration-lists";
import { ResultConfigurationSummaryStrip } from "./result-configuration-summary-strip";

type ResultConfigurationClientProps = {
  config: ResultConfiguration;
  summary: ResultConfigurationSummary;
};

type Panel = "groups" | "metrics" | "templates";

type ResultConfigurationState = {
  search: string;
  panel: Panel;
  creating: Panel | null;
};

type ResultConfigurationAction =
  | { type: "setSearch"; value: string }
  | { type: "setPanel"; value: Panel }
  | { type: "openCreate"; value: Panel }
  | { type: "closeDialog" };

export function ResultConfigurationClient({
  config,
  summary,
}: ResultConfigurationClientProps) {
  const [state, dispatch] = useReducer(resultConfigurationReducer, {
    search: "",
    panel: "groups",
    creating: null,
  });
  const filteredConfig = useMemo(() => {
    return filterResultConfiguration(config, state.search);
  }, [config, state.search]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Cấu hình chỉ tiêu
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Quản lý nhóm, chỉ tiêu, mẫu cấu hình và ngưỡng diễn giải kết quả.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => dispatch({ type: "openCreate", value: "groups" })}
          >
            <Plus className="size-4" />
            Thêm nhóm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: "openCreate", value: "metrics" })}
          >
            <Plus className="size-4" />
            Thêm chỉ tiêu
          </Button>
        </div>
      </div>

      <ResultConfigurationSummaryStrip summary={summary} />

      <div className="rounded-lg border bg-background p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={state.search}
              onChange={(event) =>
                dispatch({ type: "setSearch", value: event.target.value })
              }
              className="pl-8"
              placeholder="Tìm theo nhóm, chỉ tiêu, mẫu cấu hình"
            />
          </div>
          <FilterSelect
            label="Mục"
            value={state.panel}
            onChange={(value) =>
              dispatch({ type: "setPanel", value: value as Panel })
            }
            options={[
              ["groups", "Nhóm"],
              ["metrics", "Chỉ tiêu"],
              ["templates", "Mẫu cấu hình"],
            ]}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Đang hiển thị {visibleCount(filteredConfig, state.panel)} mục
        </div>
      </div>

      <ResultConfigurationLists config={filteredConfig} panel={state.panel} />

      <CreateGroupDialog
        open={state.creating === "groups"}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
      <CreateMetricDialog
        open={state.creating === "metrics"}
        groups={config.groups}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
      <CreateTemplateDialog
        open={state.creating === "templates"}
        sampleTypes={config.sampleTypes}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
    </div>
  );
}

function resultConfigurationReducer(
  state: ResultConfigurationState,
  action: ResultConfigurationAction
): ResultConfigurationState {
  switch (action.type) {
    case "setSearch":
      return { ...state, search: action.value };
    case "setPanel":
      return { ...state, panel: action.value };
    case "openCreate":
      return { ...state, creating: action.value };
    case "closeDialog":
      return { ...state, creating: null };
  }
}

function visibleCount(config: ResultConfiguration, panel: Panel) {
  if (panel === "groups") return config.groups.length;
  if (panel === "metrics") return config.metrics.length;
  return config.templates.length;
}
