"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { PackagePlus, Search, SlidersHorizontal } from "lucide-react";

import { DashboardDataTable } from "@/components/dashboard/data-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KitInventory, KitUnit } from "@/lib/kit-inventory/inventory";
import type { KitStatus } from "@/lib/kit-inventory/schemas";

import {
  CreateBatchDialog,
  CreateKitTypeDialog,
  CreateKitUnitsDialog,
  UpdateKitStatusDialog,
} from "./kit-inventory-dialogs";
import type { KitInventoryDialogAction } from "./kit-inventory-dialog-state";
import { KitInventorySummaryStrip } from "./kit-inventory-summary-strip";

type KitInventoryClientProps = {
  inventory: KitInventory;
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

export function KitInventoryClient({
  inventory,
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

      <section className="space-y-3 rounded-lg border bg-background p-4">
        <div>
          <h2 className="text-lg font-semibold">Số lượng kit tồn kho</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chờ biểu đồ cột ngang theo loại KIT ở story tiếp theo.
          </p>
        </div>
        <KitInventorySummaryStrip inventory={inventory} />
      </section>

      <section className="rounded-lg border bg-background p-4">
        <h2 className="text-lg font-semibold">Chi phí hiện tại</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chờ hợp đồng dữ liệu chi phí mẫu trước khi hiển thị tổng hợp.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Tạo loại KIT, lô KIT và thêm KIT
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Các thao tác quản trị KIT hiện có.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "openType" })}
            >
              <PackagePlus className="size-4" />
              Tạo loại KIT
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                dispatch({
                  type: "openBatch",
                  receivedAt: todayDateInputValueRef.current,
                })
              }
            >
              Tạo lô KIT
            </Button>
            <Button
              type="button"
              onClick={() => dispatch({ type: "openUnits" })}
            >
              Thêm KIT
            </Button>
          </div>
        </div>

        <section className="rounded-lg border bg-background p-3 md:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px] lg:grid-cols-[minmax(280px,1fr)_180px_minmax(220px,260px)] lg:items-end">
            <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1 text-sm font-medium">
              <label
                className="shrink-0 text-xs text-muted-foreground"
                htmlFor="kit-inventory-search"
              >
                Tìm kiếm
              </label>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-0 top-1.5 size-4 text-muted-foreground" />
                <Input
                  id="kit-inventory-search"
                  value={state.search}
                  onChange={(event) =>
                    dispatch({ type: "setSearch", value: event.target.value })
                  }
                  className="h-7 border-0 bg-transparent px-0 pl-6 shadow-none focus-visible:ring-0"
                  placeholder="Mã KIT, lô hoặc loại KIT"
                />
              </div>
            </div>
            <FilterSelect
              label="Trạng thái"
              value={state.status}
              onChange={(value) =>
                dispatch({
                  type: "setStatus",
                  value: value as State["status"],
                })
              }
              options={[["all", "Tất cả"], ...Object.entries(statusLabels)]}
            />
            <FilterSelect
              label="Loại KIT"
              value={state.kitTypeId}
              onChange={(value) => dispatch({ type: "setKitType", value })}
              options={[
                ["all", "Tất cả"],
                ...inventory.kitTypes.map(
                  (type) => [type.id, type.name] as [string, string]
                ),
              ]}
            />
          </div>
        </section>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Đang hiển thị {filteredKits.length}/{inventory.kits.length} KIT
        </div>

        <DashboardDataTable
          caption="Danh sách KIT trong kho"
          emptyTitle="Không có KIT phù hợp"
          emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
          rows={filteredKits.map((kit) => ({
            id: kit.id,
            cells: [
              { header: "Mã KIT", content: kit.kitCode, primary: true },
              { header: "Loại KIT", content: kit.kitTypeName },
              { header: "Lô", content: kit.lotNumber },
              { header: "Hạn dùng", content: kit.expiresOn ?? "Chưa có" },
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
                onClick={() => dispatch({ type: "openStatus", kit })}
              >
                Cập nhật
              </Button>
            ),
          }))}
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
    <Badge variant={destructive ? "destructive" : "secondary"}>
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
