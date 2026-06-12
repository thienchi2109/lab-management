import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { ExportLimitError } from "./limits";
import type { ExportActor } from "./permissions";
import type { ExportQuery } from "./query";
import { ExportRateLimitError } from "./rate-limit";

type ExportAuditAction =
  | "export.results_normalized.failed"
  | "export.results_normalized.succeeded"
  | "export.samples.failed"
  | "export.samples.succeeded";

type ExportAuditEntityTable = "sample_results" | "samples";

type ExportAuditInsert = {
  action: ExportAuditAction;
  actorId: string;
  entityId: null;
  entityTable: ExportAuditEntityTable;
  eventPayload: Record<string, unknown>;
  organizationId: string;
};

/** Cổng ghi audit event cho export, dùng cùng schema audit_events hiện có. */
export type ExportAuditPort = {
  insertAuditEvent(input: ExportAuditInsert): Promise<void>;
};

/** Input để ghi audit event export từ route handler đã resolve actor. */
export type RecordExportAuditEventInput = {
  actor: ExportActor;
  error?: unknown;
  query: ExportQuery;
  result: "failed" | "succeeded";
  rowCount?: number;
};

/** Tạo audit port Supabase cho export server-side. */
export function createSupabaseExportAuditPort(): ExportAuditPort {
  const supabase = getSupabaseAdminClient();

  return {
    async insertAuditEvent(input) {
      const { error } = await supabase.from("audit_events").insert({
        organization_id: input.organizationId,
        actor_id: input.actorId,
        action: input.action,
        entity_table: input.entityTable,
        entity_id: input.entityId,
        event_payload: input.eventPayload,
      });

      if (error) {
        throw new Error("Could not write export audit event.");
      }
    },
  };
}

/** Ghi audit event export với payload đã sanitize, không lưu raw search/filter text. */
export async function recordExportAuditEvent(
  port: ExportAuditPort,
  input: RecordExportAuditEventInput
) {
  await port.insertAuditEvent({
    action: exportAuditAction(input.query.dataset, input.result),
    actorId: input.actor.profileId,
    entityId: null,
    entityTable: exportAuditEntityTable(input.query.dataset),
    eventPayload: buildAuditPayload(input),
    organizationId: input.actor.organizationId,
  });
}

function buildAuditPayload(input: RecordExportAuditEventInput) {
  const payload: Record<string, unknown> = {
    dataset: input.query.dataset,
    fieldCount: input.query.fields.length,
    filterSummary: {
      filterKeys: Object.keys(input.query.filters).sort(),
      hasSearch: input.query.search !== null,
      sort: input.query.sort,
    },
    format: input.query.format,
    result: input.result,
    rowLimit: input.query.rowLimit,
  };

  if (input.result === "succeeded") {
    payload.rowCount = input.rowCount ?? 0;
  } else {
    payload.errorCode = exportAuditErrorCode(input.error);
    const matchedRowCount = exportAuditMatchedRowCount(input.error);
    if (matchedRowCount !== null) {
      payload.matchedRowCount = matchedRowCount;
    }
  }

  return payload;
}

function exportAuditAction(
  dataset: ExportQuery["dataset"],
  result: RecordExportAuditEventInput["result"]
): ExportAuditAction {
  if (dataset === "results-normalized") {
    return result === "succeeded"
      ? "export.results_normalized.succeeded"
      : "export.results_normalized.failed";
  }

  return result === "succeeded"
    ? "export.samples.succeeded"
    : "export.samples.failed";
}

function exportAuditEntityTable(
  dataset: ExportQuery["dataset"]
): ExportAuditEntityTable {
  return dataset === "results-normalized" ? "sample_results" : "samples";
}

function exportAuditErrorCode(error: unknown) {
  if (
    error instanceof ExportLimitError ||
    error instanceof ExportRateLimitError
  ) {
    return error.code;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return "export_failed";
}

function exportAuditMatchedRowCount(error: unknown) {
  return error instanceof ExportLimitError ? error.totalCount : null;
}
