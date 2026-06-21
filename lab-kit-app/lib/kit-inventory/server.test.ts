import { describe, expect, test, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { getKitInventory } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("kit inventory server data", () => {
  test("derives batch remaining quantity from kit status rows", async () => {
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
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      createKitInventoryClientDouble() as unknown as ReturnType<
        typeof getSupabaseAdminClient
      >
    );

    const inventory = await getKitInventory();

    expect(inventory.batches[0]?.remainingQuantity).toBe(1);
    expect(inventory.summary.inStockKits).toBe(1);
  });
});

function createKitInventoryClientDouble() {
  const responses = new Map([
    [
      "kit_types",
      [
        {
          code: "PCR",
          id: "type-1",
          is_active: true,
          manufacturer: null,
          name: "PCR Realtime",
        },
      ],
    ],
    [
      "kit_batches",
      [
        {
          expires_on: "2026-12-31",
          id: "batch-1",
          kit_type_id: "type-1",
          lot_number: "LOT-STALE",
          received_at: "2026-06-01",
          received_quantity: 2,
          remaining_quantity: 2,
        },
      ],
    ],
    [
      "kits",
      [
        {
          id: "kit-1",
          kit_batch_id: "batch-1",
          kit_code: "KIT-001",
          status: "in_stock",
          updated_at: "2026-06-06T00:00:00.000Z",
        },
        {
          id: "kit-2",
          kit_batch_id: "batch-1",
          kit_code: "KIT-002",
          status: "used",
          updated_at: "2026-06-06T00:00:00.000Z",
        },
      ],
    ],
  ]);

  return {
    from(table: string) {
      return createQueryDouble(responses.get(table) ?? []);
    },
  };
}

function createQueryDouble(data: unknown[]) {
  return {
    eq() {
      return this;
    },
    order() {
      return this;
    },
    returns() {
      return Promise.resolve({ data, error: null });
    },
    select() {
      return this;
    },
  };
}
