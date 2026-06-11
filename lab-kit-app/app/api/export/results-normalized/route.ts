import { type NextRequest, NextResponse } from "next/server";

import { parseExportQuery } from "@/lib/export/query";
import {
  exportDownloadResponse,
  exportError,
  requireExportActor,
} from "@/lib/export/route-helpers";
import { buildNormalizedResultsExportFile } from "@/lib/export/results-normalized";
import { createSupabaseSampleGridPort } from "@/lib/sample-grid/server";

/** Export kết quả mẫu chuẩn hóa theo tenant thành file download có giới hạn dòng. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const query = parseExportQuery(await request.json());
    if (query.dataset !== "results-normalized") {
      return NextResponse.json(
        {
          error: "export_query_invalid",
          message: "Truy vấn export không hợp lệ.",
        },
        { status: 400 }
      );
    }
    const actor = await requireExportActor(
      "Bạn không có quyền export kết quả xét nghiệm."
    );
    const file = await buildNormalizedResultsExportFile(
      query,
      actor,
      createSupabaseSampleGridPort()
    );

    return exportDownloadResponse(file);
  } catch (error) {
    return exportError(error, "Không thể export kết quả xét nghiệm.");
  }
}
