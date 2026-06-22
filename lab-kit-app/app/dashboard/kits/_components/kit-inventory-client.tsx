"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { SlidersHorizontal } from "lucide-react";

import { DashboardDataTable } from "@/components/dashboard/data-table";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { KitInventory, KitUnit } from "@/lib/kit-inventory/inventory";
import type { KitStatus } from "@/lib/kit-inventory/schemas";
import type { SampleCostSummary } from "@/lib/sample-metadata/sample-cost-summary";

import { KitInventoryCommandBand } from "./kit-inventory-command-band";
import {
  CreateBatchDialog,
  CreateKitTypeDialog,
  CreateKitUnitsDialog,
  UpdateKitStatusDialog,
} from "./kit-inventory-dialogs";
import type { KitInventoryDialogAction } from "./kit-inventory-dialog-state";
import { KitInventoryOverviewPanel } from "./kit-inventory-overview-panel";
import { KitSampleCostSummarySection } from "./kit-sample-cost-summary-section";

type KitInventoryClientProps = {
  inventory: KitInventory;
  sampleCostSummary?: SampleCostSummary;
  actions: {
    createKitType: KitInventoryDialogAction;
    createKitBatch: KitInventoryDialogAction;
    createKitUnits: KitInventoryDialogAction;
    updateKitStatus: KitInventoryDialogAction;
  };
};

const statusLabels: Record<KitStatus, string> = {
  in_stock: "Còn tồn",
  assigned: "Đã gán",
  used: "Đã dùng",
  void: "Hủy",
  expired: "Hết hạn",
  lost: "Thất lạc",
};

const statusOptions: Array<[string, string]> = [
  ["all", "Tất cả"],
  ...Object.entries(statusLabels),
];

const backgroundMarkOpacityProperty = "--app-background-mark-opacity";

export function KitInventoryClient({
  inventory,
  sampleCostSummary = { groups: [] },
  actions,
}: KitInventoryClientProps) {
  const todayDateInputValueRef = useRef("");
  const [state, dispatch] = useReducer(kitInventoryReducer, {
    search: "",
    status: "all",
    kitTypeId: "all",
    creatingType: false,
    creatingBatch: false,
    batchReceivedAt: "",
    creatingUnits: false,
    statusKit: null,
  });
  const filteredKits = useMemo(() => {
    return inventory.kits.filter((kit) => {
      const search = state.search.trim().toLowerCase();
      const matchesSearch =
        search.length === 0 ||
        kit.kitCode.toLowerCase().includes(search) ||
        kit.lotNumber.toLowerCase().includes(search) ||
        kit.kitTypeName.toLowerCase().includes(search);
      const matchesStatus =
        state.status === "all" || kit.status === state.status;
      const matchesType =
        state.kitTypeId === "all" ||
        inventory.batches.some((batch) => {
          return (
            batch.id === kit.batchId && batch.kitTypeId === state.kitTypeId
          );
        });

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [
    inventory.batches,
    inventory.kits,
    state.kitTypeId,
    state.search,
    state.status,
  ]);

  useEffect(() => {
    todayDateInputValueRef.current = getLocalDateInputValue(new Date());
  }, []);

  useEffect(() => {
    const previousBackgroundMarkOpacity = document.body.style.getPropertyValue(
      backgroundMarkOpacityProperty
    );

    document.body.style.setProperty(backgroundMarkOpacityProperty, "0.08");

    return () => {
      if (previousBackgroundMarkOpacity) {
        document.body.style.setProperty(
          backgroundMarkOpacityProperty,
          previousBackgroundMarkOpacity
        );
      } else {
        document.body.style.removeProperty(backgroundMarkOpacityProperty);
      }
    };
  }, []);

  const kitTypeOptions: Array<[string, string]> = [
    ["all", "Tất cả"],
    ...inventory.kitTypes.map(
      (type) => [type.id, type.name] as [string, string]
    ),
  ];

  return (
    <PageContainer className="gap-5">
      <div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Kho KIT
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Quản lý loại KIT, lô KIT, mã KIT, tồn kho và hạn dùng phục vụ vận
            hành xét nghiệm.
          </p>
        </div>
      </div>

      <KitInventoryOverviewPanel inventory={inventory} />

      <KitSampleCostSummarySection
        className="order-3 md:order-2"
        summary={sampleCostSummary}
      />

      <section className="order-2 md:order-3 space-y-4">
        <KitInventoryCommandBand
          kitTypeId={state.kitTypeId}
          kitTypeOptions={kitTypeOptions}
          onCreateBatch={() =>
            dispatch({
              type: "openBatch",
              receivedAt: todayDateInputValueRef.current,
            })
          }
          onCreateKitType={() => dispatch({ type: "openType" })}
          onCreateUnits={() => dispatch({ type: "openUnits" })}
          onKitTypeChange={(value) => dispatch({ type: "setKitType", value })}
          onSearchChange={(value) => dispatch({ type: "setSearch", value })}
          onStatusChange={(value) =>
            dispatch({
              type: "setStatus",
              value,
            })
          }
          search={state.search}
          status={state.status}
          statusOptions={statusOptions}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Đang hiển thị {filteredKits.length}/{inventory.kits.length} KIT
        </div>

        <DashboardDataTable
          caption="Danh sách KIT trong kho"
          density="compact"
          emptyTitle="Không có KIT phù hợp"
          emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
          rows={filteredKits.map((kit) => ({
            id: kit.id,
            cells: [
              {
                header: "Mã KIT",
                content: kit.kitCode,
                desktopClassName: "font-mono tabular-nums text-foreground",
                mobileClassName: "items-center",
                mobileContent: (
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {kit.kitCode}
                  </span>
                ),
                primary: true,
              },
              { header: "Loại KIT", content: kit.kitTypeName },
              { header: "Lô", content: kit.lotNumber },
              {
                header: "Hạn dùng",
                content: kit.expiresOn ?? "Chưa có",
                desktopClassName: "font-mono tabular-nums",
                mobileContent: (
                  <span className="font-mono tabular-nums">
                    {kit.expiresOn ?? "Chưa có"}
                  </span>
                ),
              },
              {
                header: "Trạng thái",
                content: <StatusBadge status={kit.status} />,
              },
            ],
            actions: (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-medium"
                onClick={() => dispatch({ type: "openStatus", kit })}
              >
                Cập nhật
              </Button>
            ),
          }))}
          tone="workspace"
        />
      </section>

      <CreateKitTypeDialog
        open={state.creatingType}
        formAction={actions.createKitType}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
      <CreateBatchDialog
        open={state.creatingBatch}
        kitTypes={inventory.kitTypes}
        defaultReceivedAt={state.batchReceivedAt}
        formAction={actions.createKitBatch}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
      <CreateKitUnitsDialog
        open={state.creatingUnits}
        batches={inventory.batches}
        formAction={actions.createKitUnits}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
      <UpdateKitStatusDialog
        kit={state.statusKit}
        formAction={actions.updateKitStatus}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
    </PageContainer>
  );
}

function StatusBadge({ status }: { status: KitStatus }) {
  const destructive = ["void", "expired", "lost"].includes(status);

  return (
    <Badge
      className={
        destructive
          ? undefined
          : "bg-primary/10 text-primary hover:bg-primary/10"
      }
      variant={destructive ? "destructive" : "secondary"}
    >
      {statusLabels[status]}
    </Badge>
  );
}

type State = {
  search: string;
  status: "all" | KitStatus;
  kitTypeId: string;
  creatingType: boolean;
  creatingBatch: boolean;
  batchReceivedAt: string;
  creatingUnits: boolean;
  statusKit: KitUnit | null;
};

type Action =
  | { type: "setSearch"; value: string }
  | { type: "setStatus"; value: State["status"] }
  | { type: "setKitType"; value: string }
  | { type: "openType" }
  | { type: "openBatch"; receivedAt: string }
  | { type: "openUnits" }
  | { type: "openStatus"; kit: KitUnit }
  | { type: "closeDialog" };

function kitInventoryReducer(state: State, action: Action): State {
  switch (action.type) {
    case "setSearch":
      return { ...state, search: action.value };
    case "setStatus":
      return { ...state, status: action.value };
    case "setKitType":
      return { ...state, kitTypeId: action.value };
    case "openType":
      return { ...state, creatingType: true };
    case "openBatch":
      return {
        ...state,
        creatingBatch: true,
        batchReceivedAt: action.receivedAt,
      };
    case "openUnits":
      return { ...state, creatingUnits: true };
    case "openStatus":
      return { ...state, statusKit: action.kit };
    case "closeDialog":
      return {
        ...state,
        creatingType: false,
        creatingBatch: false,
        batchReceivedAt: "",
        creatingUnits: false,
        statusKit: null,
      };
  }
}

function getLocalDateInputValue(date: Date) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 10);
}
