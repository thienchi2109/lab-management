import { PackagePlus, Search } from "lucide-react";

import { FilterSelect } from "@/components/dashboard/filter-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KitStatus } from "@/lib/kit-inventory/schemas";

type KitInventoryCommandBandProps = {
  kitTypeId: string;
  kitTypeOptions: Array<[string, string]>;
  onCreateBatch: () => void;
  onCreateKitType: () => void;
  onCreateUnits: () => void;
  onKitTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | KitStatus) => void;
  search: string;
  status: "all" | KitStatus;
  statusOptions: Array<[string, string]>;
};

/** Gom thao tác quản trị, tìm kiếm và bộ lọc vào cùng một command band. */
export function KitInventoryCommandBand({
  kitTypeId,
  kitTypeOptions,
  onCreateBatch,
  onCreateKitType,
  onCreateUnits,
  onKitTypeChange,
  onSearchChange,
  onStatusChange,
  search,
  status,
  statusOptions,
}: KitInventoryCommandBandProps) {
  return (
    <section
      data-kit-inventory-command-band="true"
      className="rounded-xl border bg-card p-3 md:p-4"
    >
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-lg font-semibold">
            Tạo loại KIT, lô KIT và thêm KIT
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tìm nhanh mã KIT rồi thao tác quản trị trên cùng một vùng làm việc.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onCreateKitType}>
            <PackagePlus className="size-4" />
            Tạo loại KIT
          </Button>
          <Button type="button" variant="outline" onClick={onCreateBatch}>
            Tạo lô KIT
          </Button>
          <Button type="button" onClick={onCreateUnits}>
            Thêm KIT
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px] lg:grid-cols-[minmax(280px,1fr)_180px_minmax(220px,260px)] lg:items-end">
        <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border bg-muted/20 px-2.5 py-1 text-sm font-medium focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
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
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-7 border-0 bg-transparent px-0 pl-6 shadow-none focus-visible:ring-0"
              placeholder="Mã KIT, lô hoặc loại KIT"
            />
          </div>
        </div>
        <FilterSelect
          label="Trạng thái"
          value={status}
          onChange={(value) => onStatusChange(value as "all" | KitStatus)}
          options={statusOptions}
        />
        <FilterSelect
          label="Loại KIT"
          value={kitTypeId}
          onChange={onKitTypeChange}
          options={kitTypeOptions}
        />
      </div>
    </section>
  );
}
