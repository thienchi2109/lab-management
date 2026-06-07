import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { hasAnyRole, type AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import {
  getSampleResultEntry,
  saveSampleResults,
  type SampleResultActor,
  type SaveSampleResultsInput,
} from "@/lib/sample-results/operations";
import { createSupabaseSampleResultsPort } from "@/lib/sample-results/server";

type RouteContext = {
  params: Promise<{ sampleId: string }>;
};

/** Return dynamic result-entry data for a tenant-scoped sample. */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { sampleId } = await context.params;
    const actor = await requireSampleResultActor(false);
    const entry = await getSampleResultEntry(
      sampleId,
      actor,
      createSupabaseSampleResultsPort()
    );

    return NextResponse.json({ ...entry, canWrite: actor.canWrite });
  } catch (error) {
    return jsonError(error, "Không thể tải kết quả xét nghiệm.");
  }
}

/** Save dynamic sample results after server-side role and payload checks. */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { sampleId } = await context.params;
    const actor = await requireSampleResultActor(true);
    const input = parseSaveInput(await request.json());

    await saveSampleResults(
      sampleId,
      input,
      actor,
      createSupabaseSampleResultsPort()
    );
    revalidatePath("/dashboard/samples");
    revalidatePath(`/dashboard/samples/${sampleId}/results`);

    return NextResponse.json({
      status: "success",
      message: "Đã lưu kết quả xét nghiệm.",
    });
  } catch (error) {
    return jsonError(error, "Không thể lưu kết quả xét nghiệm.");
  }
}

async function requireSampleResultActor(write: boolean) {
  const session = await getCurrentSession();

  if (!session) {
    throw new ResponseError(403, permissionMessage(write));
  }

  const allowed: AppRole[] = write
    ? ["admin", "editor"]
    : ["admin", "editor", "viewer"];

  if (!hasAnyRole(session.memberships, allowed)) {
    throw new ResponseError(403, permissionMessage(write));
  }

  const membership = session.memberships.find(
    (membership) => membership.isActive && allowed.includes(membership.role)
  );

  if (!membership) {
    throw new ResponseError(403, permissionMessage(write));
  }

  return toActor(session, membership.organizationId, membership.role, write);
}

function toActor(
  session: CurrentSession,
  organizationId: string,
  role: AppRole,
  write: boolean
): SampleResultActor {
  const canWrite = role === "admin" || role === "editor";

  if (write && !canWrite) {
    throw new ResponseError(403, permissionMessage(true));
  }

  return {
    profileId: session.profile.id,
    organizationId,
    canWrite,
  };
}

function permissionMessage(write: boolean) {
  return write
    ? "Bạn không có quyền ghi kết quả xét nghiệm."
    : "Bạn không có quyền xem kết quả xét nghiệm.";
}

function parseSaveInput(value: unknown): SaveSampleResultsInput {
  if (!isRecord(value)) {
    throw new ResponseError(400, "Payload kết quả không hợp lệ.");
  }

  const results = Array.isArray(value.results) ? value.results : null;
  const groupConclusions = Array.isArray(value.groupConclusions)
    ? value.groupConclusions
    : null;

  if (!results || !groupConclusions) {
    throw new ResponseError(400, "Payload kết quả không hợp lệ.");
  }

  return {
    results: results.map(parseResultItem),
    groupConclusions: groupConclusions.map(parseConclusionItem),
  };
}

function parseResultItem(value: unknown) {
  if (!isRecord(value) || typeof value.metricId !== "string") {
    throw new ResponseError(400, "Payload chỉ tiêu không hợp lệ.");
  }

  return {
    metricId: value.metricId,
    value: value.value,
  };
}

function parseConclusionItem(value: unknown) {
  if (
    !isRecord(value) ||
    typeof value.groupId !== "string" ||
    typeof value.conclusionText !== "string"
  ) {
    throw new ResponseError(400, "Payload kết luận nhóm không hợp lệ.");
  }

  return {
    groupId: value.groupId,
    conclusionText: value.conclusionText,
  };
}

function jsonError(error: unknown, fallback: string) {
  if (error instanceof ResponseError) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      status: "error",
      message: error instanceof Error ? error.message : fallback,
    },
    { status: 500 }
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class ResponseError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ResponseError";
  }
}
