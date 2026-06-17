import "server-only";

import type { AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  listSampleGridPage,
  type SampleGridActor,
  type SampleGridPort,
} from "./operations";
import type { SampleGridSearchParams } from "./query";
import {
  applySampleGridFilters,
  applySampleGridSearch,
  getSampleGridSelect,
  getSampleGridSortColumn,
  mapSampleGridRow,
  type SampleGridQueryBuilder,
} from "./server-adapter";
import {
  createSampleGridResultSummaryClient,
  listSampleGridResultSummaries,
  type SupabaseResultSummarySource,
} from "./result-summary-server";
import { listSampleGridResultColumnOptions } from "./result-column-options-server";
import { listSampleGridFilterOptions } from "./filter-options-server";
import { listSampleGridResultGroupOptions } from "./result-group-options-server";

type ResultSummaryTableSource = {
  select(columns: string): unknown;
};
type ResultSummaryQuery = ReturnType<
  ReturnType<SupabaseResultSummarySource["from"]>["select"]
>;
type ResultSummarySourceCandidate = {
  from(table: string): unknown;
};

const SAMPLE_GRID_READ_ROLES = ["admin", "editor", "viewer"] as const;

/** Lỗi phân quyền khi người dùng không được đọc data grid mẫu. */
export class SampleGridAccessError extends Error {
  constructor() {
    super("Sample grid read access required.");
    this.name = "SampleGridAccessError";
  }
}

/** Load one tenant-scoped sample grid page for the current session. */
export async function getSampleGridPage(searchParams: SampleGridSearchParams) {
  const actor = await requireSampleGridActor();

  return listSampleGridPage(
    searchParams,
    actor,
    createSupabaseSampleGridPort()
  );
}

/** Create the Supabase-backed read port for sample grid pages. */
export function createSupabaseSampleGridPort(): SampleGridPort {
  const supabase = getSupabaseAdminClient();
  const resultSummaryClient = createSampleGridResultSummaryClient(
    toSupabaseResultSummarySource(supabase)
  );

  return {
    async listSamples(input) {
      const samples = supabase.from("samples") as unknown as {
        select(
          columns: string,
          options: { count: "exact" }
        ): SampleGridQueryBuilder;
      };
      let query = samples
        .select(getSampleGridSelect(input.query), { count: "exact" })
        .eq("organization_id", input.organizationId);

      query = applySampleGridFilters(query, input.query, input.organizationId);
      query = applySampleGridSearch(query, input.query);
      query = query.order(getSampleGridSortColumn(input.query), {
        ascending: input.query.sort.direction === "asc",
      });

      const { count, data, error } = await query.range(
        input.query.offset,
        input.query.offset + input.query.limit - 1
      );

      if (error) {
        throw new Error("Không thể tải trang dữ liệu mẫu xét nghiệm.");
      }

      return {
        rows: (data ?? []).map(mapSampleGridRow),
        totalCount: count ?? 0,
      };
    },
    async listSampleResultSummaries(input) {
      return listSampleGridResultSummaries(resultSummaryClient, input);
    },
    async listResultColumnOptions(input) {
      return listSampleGridResultColumnOptions(resultSummaryClient, input);
    },
    async listResultGroupOptions(input) {
      return listSampleGridResultGroupOptions(resultSummaryClient, input);
    },
    async listFilterOptions(input) {
      return listSampleGridFilterOptions(resultSummaryClient, input);
    },
  };
}

function toSupabaseResultSummarySource(
  source: unknown
): SupabaseResultSummarySource {
  if (!hasFrom(source)) {
    throw new Error("Supabase client không hỗ trợ đọc summary kết quả.");
  }

  return {
    from(table: string) {
      const tableSource = source.from(table);

      if (!hasSelect(tableSource)) {
        throw new Error(
          "Supabase table client không hỗ trợ đọc summary kết quả."
        );
      }

      return {
        select(columns: string) {
          const query = tableSource.select(columns);

          if (!isResultSummaryQuery(query)) {
            throw new Error(
              "Supabase query builder không hỗ trợ đọc summary kết quả."
            );
          }

          return query;
        },
      };
    },
  };
}

function hasFrom(value: unknown): value is ResultSummarySourceCandidate {
  return hasFunctionMember(value, "from");
}

function hasSelect(value: unknown): value is ResultSummaryTableSource {
  return hasFunctionMember(value, "select");
}

function isResultSummaryQuery(value: unknown): value is ResultSummaryQuery {
  return (
    hasFunctionMember(value, "eq") &&
    hasFunctionMember(value, "in") &&
    hasFunctionMember(value, "order") &&
    hasFunctionMember(value, "then")
  );
}

function hasFunctionMember<K extends string>(
  value: unknown,
  member: K
): value is Record<K, (...args: unknown[]) => unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    member in value &&
    typeof (value as Record<K, unknown>)[member] === "function"
  );
}

async function requireSampleGridActor(): Promise<SampleGridActor> {
  const session = await getCurrentSession();

  if (!session) {
    throw new SampleGridAccessError();
  }

  const actor = getActiveSampleGridActor(session);

  if (!actor) {
    throw new SampleGridAccessError();
  }

  return actor;
}

function getActiveSampleGridActor(
  session: CurrentSession
): SampleGridActor | null {
  const membership = session.memberships.find((item) => {
    return (
      item.isActive && SAMPLE_GRID_READ_ROLES.includes(item.role as AppRole)
    );
  });

  if (!membership) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    profileId: session.profile.id,
    role: membership.role,
  };
}
