import { describe, expect, test, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { getSampleCostSummary } from "./sample-cost-summary-server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("sample cost summary server data", () => {
  test("loads tenant sample costs and maps the four contracted groups", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      memberships: [
        { isActive: true, organizationId: "org-1", role: "viewer" },
      ],
      profile: {
        displayName: "Viewer",
        email: "viewer@example.com",
        id: "profile-1",
        username: "viewer",
      },
    });
    const query = createSampleCostQueryDouble([
      {
        billing_status: "paid",
        sample_cost_amount_vnd: 200000,
        sample_cost_payment_method: "bank_transfer",
      },
      {
        billing_status: "invoiced",
        sample_cost_amount_vnd: 125000,
        sample_cost_payment_method: null,
      },
    ]);
    const from = vi.fn(() => query);
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const summary = await getSampleCostSummary();

    expect(summary.groups).toEqual([
      { group: "cash", label: "Tiền mặt thu được", totalAmountVnd: 0 },
      {
        group: "bank_transfer",
        label: "Nhận chuyển khoản",
        totalAmountVnd: 200000,
      },
      { group: "invoice", label: "Ghi hóa đơn", totalAmountVnd: 125000 },
      { group: "other", label: "Khác", totalAmountVnd: 0 },
    ]);
    expect(from).toHaveBeenCalledWith("samples");
    expect(query.select).toHaveBeenCalledWith(
      "billing_status, sample_cost_amount_vnd, sample_cost_payment_method"
    );
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-1");
  });
});

function createSampleCostQueryDouble(rows: unknown[]) {
  const query = {
    eq: vi.fn(() => query),
    returns: vi.fn(async () => ({ data: rows, error: null })),
    select: vi.fn(() => query),
  };

  return query;
}
