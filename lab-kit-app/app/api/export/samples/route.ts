import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { resolveExportActor, type ExportActor } from "@/lib/export/permissions";
import {
  ExportQueryValidationError,
  parseExportQuery,
} from "@/lib/export/query";
import { buildSampleExportFile } from "@/lib/export/samples";
import { createSupabaseSampleGridPort } from "@/lib/sample-grid/server";

/** Export tenant-scoped sample metadata as a bounded download file. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const query = parseExportQuery(await request.json());
    const actor = await requireSampleExportActor();
    const file = await buildSampleExportFile(
      query,
      actor,
      createSupabaseSampleGridPort()
    );

    return new NextResponse(Uint8Array.from(file.body), {
      headers: {
        "content-disposition": `attachment; filename="${file.filename}"`,
        "content-type": file.contentType,
      },
      status: 200,
    });
  } catch (error) {
    return exportError(error);
  }
}

async function requireSampleExportActor(): Promise<ExportActor> {
  const session = await getCurrentSession();
  const organizationId = getExportOrganizationId(session);

  if (!session || !organizationId) {
    throw new ResponseError(
      403,
      "export_forbidden",
      "Bạn không có quyền export dữ liệu mẫu."
    );
  }

  const actor = resolveExportActor({
    grants: [],
    organizationId,
    session,
  });

  if (!actor) {
    throw new ResponseError(
      403,
      "export_forbidden",
      "Bạn không có quyền export dữ liệu mẫu."
    );
  }

  return actor;
}

function getExportOrganizationId(session: CurrentSession | null) {
  return (
    session?.memberships.find((membership) => {
      return (
        membership.isActive &&
        (membership.role === "admin" ||
          membership.role === "editor" ||
          membership.role === "viewer")
      );
    })?.organizationId ?? null
  );
}

function exportError(error: unknown) {
  if (error instanceof ExportQueryValidationError) {
    return jsonError(400, error.code, error.message);
  }

  if (error instanceof ResponseError) {
    return jsonError(error.status, error.code, error.message);
  }

  return jsonError(500, "export_failed", "Không thể export dữ liệu mẫu.");
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

class ResponseError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ResponseError";
    this.code = code;
    this.status = status;
  }
}
