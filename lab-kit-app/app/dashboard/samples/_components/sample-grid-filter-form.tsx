import Link from "next/link";
import { Search } from "lucide-react";

import { SelectField } from "@/components/dashboard/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleFilterCombobox } from "./sample-filter-combobox";
import { appendSampleGridFilterParams } from "./sample-grid-filter-params";

type SampleGridFilterFormProps = {
  formId?: string;
  idPrefix: string;
  page: SampleGridPage;
  showSubmit?: boolean;
  variant: "inline" | "sheet";
};

/** Render form lọc mẫu dùng chung cho desktop inline và mobile bottom sheet. */
export function SampleGridFilterForm({
  formId,
  idPrefix,
  page,
  showSubmit = true,
  variant,
}: SampleGridFilterFormProps) {
  const resultGroupLabelById = new Map(
    page.resultGroupOptions.map((option) => [option.id, option.label])
  );
  const selectedResultGroupIds = page.query.filters.resultGroupIds ?? [];
  const isSheet = variant === "sheet";

  return (
    <form
      action="/dashboard/samples"
      className={cn(isSheet ? "space-y-4" : "border-t p-4")}
      id={formId}
      method="get"
    >
      <input name="page" type="hidden" value="1" />
      {page.selectedResultColumnKeys.map((key) => (
        <input key={key} name="resultColumns" type="hidden" value={key} />
      ))}
      <div
        className={cn(
          "grid gap-3",
          isSheet
            ? "grid-cols-1"
            : "md:grid-cols-2 xl:grid-cols-[1fr_150px_150px_170px_190px_190px_auto] xl:items-end"
        )}
      >
        <label
          className="space-y-1.5 text-sm font-medium"
          htmlFor={`${idPrefix}-search`}
        >
          <span>Tìm kiếm</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              defaultValue={page.query.search ?? ""}
              id={`${idPrefix}-search`}
              name="search"
              placeholder="Mã mẫu hoặc khách hàng"
            />
          </div>
        </label>
        <label
          className="space-y-1.5 text-sm font-medium"
          htmlFor={`${idPrefix}-received-from`}
        >
          <span>Từ ngày nhận</span>
          <Input
            defaultValue={page.query.filters.receivedFrom ?? ""}
            id={`${idPrefix}-received-from`}
            name="receivedFrom"
            type="date"
          />
        </label>
        <label
          className="space-y-1.5 text-sm font-medium"
          htmlFor={`${idPrefix}-received-to`}
        >
          <span>Đến ngày nhận</span>
          <Input
            defaultValue={page.query.filters.receivedTo ?? ""}
            id={`${idPrefix}-received-to`}
            name="receivedTo"
            type="date"
          />
        </label>
        <SelectField
          defaultValue={page.query.filters.sampleTypeId ?? ""}
          label="Loại mẫu"
          name="sampleTypeId"
          options={[
            ["", "Tất cả"],
            ...page.filterOptions.sampleTypes.map(
              (option) => [option.id, option.label] as [string, string]
            ),
          ]}
        />
        <SampleFilterCombobox
          defaultIdValue={page.query.filters.customerId}
          defaultTextValue={page.query.filters.customerName}
          idName="customerId"
          inputId={`${idPrefix}-customer`}
          label="Khách hàng"
          listId={`${idPrefix}-customer-options`}
          options={page.filterOptions.customers}
          placeholder="Tất cả khách hàng"
          textName="customerName"
        />
        <SampleFilterCombobox
          defaultIdValue={page.query.filters.companyId}
          defaultTextValue={page.query.filters.companyName}
          idName="companyId"
          inputId={`${idPrefix}-company`}
          label="Công ty"
          listId={`${idPrefix}-company-options`}
          options={page.filterOptions.companies}
          placeholder="Tất cả công ty"
          textName="companyName"
        />
        {showSubmit ? <Button type="submit">Áp dụng</Button> : null}
      </div>
      {page.resultGroupOptions.length > 0 ? (
        <fieldset className={cn(isSheet ? "space-y-2" : "mt-4 space-y-2")}>
          <legend className="text-xs font-semibold text-foreground">
            Nhóm chỉ tiêu
          </legend>
          <div className="flex flex-wrap gap-2">
            {page.resultGroupOptions.map((option) => (
              <label
                key={option.id}
                className="flex min-h-9 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <input
                  className="size-4 accent-primary"
                  defaultChecked={selectedResultGroupIds.includes(option.id)}
                  name="resultGroupIds"
                  type="checkbox"
                  value={option.id}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {selectedResultGroupIds.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedResultGroupIds.map((groupId) => {
                const label = resultGroupLabelById.get(groupId) ?? groupId;

                return (
                  <Link
                    key={groupId}
                    aria-label={`Xóa ${label}`}
                    className="rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-background"
                    href={buildResultGroupRemovalHref(page, groupId)}
                  >
                    Đang lọc: {label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </fieldset>
      ) : null}
    </form>
  );
}

function buildResultGroupRemovalHref(
  page: SampleGridPage,
  removedGroupId: string
) {
  const params = new URLSearchParams();

  appendSampleGridFilterParams(params, page, removedGroupId);
  params.set("page", "1");
  params.set("pageSize", String(page.query.pageSize));
  for (const key of page.selectedResultColumnKeys) {
    params.append("resultColumns", key);
  }

  return `/dashboard/samples?${params.toString()}`;
}
