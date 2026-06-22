import type { SampleBillingStatus } from "./schemas";

/** Khóa nhóm chi phí mẫu dùng cho contract tổng hợp chi phí. */
export type SampleCostGroupKey = "cash" | "bank_transfer" | "invoice" | "other";

/** Phương thức thu tiền bổ sung khi `billing_status` là `paid`. */
export type SampleCostPaymentMethod = "cash" | "bank_transfer" | "other";

/** Một nhóm tổng chi phí mẫu đã được chuẩn hóa cho UI. */
export type SampleCostGroup = {
  group: SampleCostGroupKey;
  label: string;
  totalAmountVnd: number;
};

/** Tổng hợp chi phí mẫu theo bốn nhóm contract đã chốt. */
export type SampleCostSummary = {
  groups: SampleCostGroup[];
};

/** Dòng dữ liệu tối thiểu cần để tính tổng chi phí mẫu. */
export type SampleCostSummaryRow = {
  billing_status: SampleBillingStatus;
  sample_cost_amount_vnd?: number | string | null;
  sample_cost_payment_method?: string | null;
};

const SAMPLE_COST_PAYMENT_METHODS = ["cash", "bank_transfer", "other"] as const;
const SAMPLE_COST_GROUPS: SampleCostGroup[] = [
  { group: "cash", label: "Tiền mặt thu được", totalAmountVnd: 0 },
  { group: "bank_transfer", label: "Nhận chuyển khoản", totalAmountVnd: 0 },
  { group: "invoice", label: "Ghi hóa đơn", totalAmountVnd: 0 },
  { group: "other", label: "Khác", totalAmountVnd: 0 },
];

/** Normalize durable sample cost columns before aggregation. */
export function normalizeSampleCostColumns(row: SampleCostSummaryRow): {
  amountVnd: number | null;
  paymentMethod: SampleCostPaymentMethod | null;
} {
  const amountVnd = normalizeSampleCostAmount(row.sample_cost_amount_vnd);

  return { amountVnd, paymentMethod: normalizeSampleCostPaymentMethod(row) };
}

/** Map các dòng mẫu sang tổng chi phí theo bốn nhóm contract. */
export function mapSampleCostSummaryRows(
  rows: SampleCostSummaryRow[]
): SampleCostSummary {
  const groups = SAMPLE_COST_GROUPS.map((group) => ({ ...group }));

  for (const row of rows) {
    const cost = normalizeSampleCostColumns(row);
    const groupKey = resolveSampleCostGroup(row.billing_status, cost);

    if (!groupKey || cost.amountVnd === null) continue;

    const group = groups.find((item) => item.group === groupKey);
    if (group) group.totalAmountVnd += cost.amountVnd;
  }

  return { groups };
}

function resolveSampleCostGroup(
  billingStatus: SampleBillingStatus,
  cost: ReturnType<typeof normalizeSampleCostColumns>
): SampleCostGroupKey | null {
  if (cost.amountVnd === null) return null;
  if (billingStatus === "invoiced") return "invoice";

  if (billingStatus === "paid") {
    return cost.paymentMethod ?? "other";
  }

  return "other";
}

function normalizeSampleCostAmount(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;

  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function normalizeSampleCostPaymentMethod(
  row: SampleCostSummaryRow
): SampleCostPaymentMethod | null {
  return SAMPLE_COST_PAYMENT_METHODS.some(
    (method) => method === row.sample_cost_payment_method
  )
    ? (row.sample_cost_payment_method as SampleCostPaymentMethod)
    : null;
}
