import { type NextRequest, NextResponse } from "next/server";

import {
  createSupabaseExportAuditPort,
  recordExportAuditEvent,
} from "@/lib/export/audit";
import type { ExportActor } from "@/lib/export/permissions";
import {
  exportDownloadResponse,
  exportError,
  recordFailedExportAuditEvent,
  requireExportActor,
} from "@/lib/export/route-helpers";
import { assertExportRateLimit } from "@/lib/export/rate-limit";
import { parseExportQuery, type SampleExportQuery } from "@/lib/export/query";
import { buildSampleExportFile } from "@/lib/export/samples";
import { createSupabaseSampleGridPort } from "@/lib/sample-grid/server";

/** Export metadata mẫu theo tenant thành file download có giới hạn dòng. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let actor: ExportActor | null = null;
  let query: SampleExportQuery | null = null;

  try {
    const parsedQuery = parseExportQuery(await request.json());
    if (parsedQuery.dataset !== "samples") {
      return NextResponse.json(
        {
          error: "export_query_invalid",
          message: "Truy vấn export không hợp lệ.",
        },
        { status: 400 }
      );
    }
    query = parsedQuery;
    actor = await requireExportActor("Bạn không có quyền export dữ liệu mẫu.");
    assertExportRateLimit({ actor, dataset: query.dataset });
    const file = await buildSampleExportFile(
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
    await recordFailedExportAuditEvent({ actor, error, query });

    return exportError(error, "Không thể export dữ liệu mẫu.");
  }
}
