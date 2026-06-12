import { type NextRequest, NextResponse } from "next/server";

import {
  createSupabaseExportAuditPort,
  recordExportAuditEvent,
} from "@/lib/export/audit";
import type { ExportActor } from "@/lib/export/permissions";
import {
  parseExportQuery,
  type NormalizedResultsExportQuery,
} from "@/lib/export/query";
import { assertExportRateLimit } from "@/lib/export/rate-limit";
import {
  exportDownloadResponse,
  exportError,
  requireExportActor,
} from "@/lib/export/route-helpers";
import { buildNormalizedResultsExportFile } from "@/lib/export/results-normalized";
import { createSupabaseSampleGridPort } from "@/lib/sample-grid/server";

/** Export kết quả mẫu chuẩn hóa theo tenant thành file download có giới hạn dòng. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let actor: ExportActor | null = null;
  let query: NormalizedResultsExportQuery | null = null;

  try {
    const parsedQuery = parseExportQuery(await request.json());
    if (parsedQuery.dataset !== "results-normalized") {
      return NextResponse.json(
        {
          error: "export_query_invalid",
          message: "Truy vấn export không hợp lệ.",
        },
        { status: 400 }
      );
    }
    query = parsedQuery;
    actor = await requireExportActor(
      "Bạn không có quyền export kết quả xét nghiệm."
    );
    assertExportRateLimit({ actor, dataset: query.dataset });
    const file = await buildNormalizedResultsExportFile(
      query,
      actor,
      createSupabaseSampleGridPort()
    );
    await recordExportAuditEvent(createSupabaseExportAuditPort(), {
      actor,
      query,
      result: "succeeded",
      rowCount: file.rowCount,
    });

    return exportDownloadResponse(file);
  } catch (error) {
    if (actor && query) {
      try {
        await recordExportAuditEvent(createSupabaseExportAuditPort(), {
          actor,
          error,
          query,
          result: "failed",
        });
      } catch (auditError) {
        return exportError(auditError, "Không thể export kết quả xét nghiệm.");
      }
    }

    return exportError(error, "Không thể export kết quả xét nghiệm.");
  }
}
