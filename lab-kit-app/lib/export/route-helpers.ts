import { NextResponse } from "next/server";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";

import { resolveExportActor, type ExportActor } from "./permissions";
import { ExportQueryValidationError } from "./query";
import type { TabularExportFile } from "./files";

/** Lỗi HTTP có code ổn định cho route export. */
export class ExportRouteError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ExportRouteError";
    this.code = code;
    this.status = status;
  }
}

/** Resolve actor export từ session server, không nhận tenant từ payload client. */
export async function requireExportActor(
  message: string
): Promise<ExportActor> {
  const session = await getCurrentSession();
  const organizationId = getExportOrganizationId(session);

  if (!session || !organizationId) {
    throw new ExportRouteError(403, "export_forbidden", message);
  }

  const actor = resolveExportActor({
    grants: [],
    organizationId,
    session,
  });

  if (!actor) {
    throw new ExportRouteError(403, "export_forbidden", message);
  }

  return actor;
}

/** Chuyển file export thành download response. */
export function exportDownloadResponse(file: TabularExportFile) {
  return new NextResponse(Uint8Array.from(file.body), {
    headers: {
      "content-disposition": `attachment; filename="${file.filename}"`,
      "content-type": file.contentType,
    },
    status: 200,
  });
}

/** Chuyển lỗi export thành JSON response ổn định. */
export function exportError(error: unknown, fallbackMessage: string) {
  if (error instanceof ExportQueryValidationError) {
    return jsonError(400, error.code, error.message);
  }

  if (error instanceof ExportRouteError) {
    return jsonError(error.status, error.code, error.message);
  }

  return jsonError(500, "export_failed", fallbackMessage);
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

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}
