import { NextResponse } from "next/server";

import type { AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";

import type { ReportImageActor } from "./operations";

const REPORT_IMAGE_READ_ROLES: AppRole[] = ["admin", "editor", "viewer"];

/** Resolve the active report image actor for API route handlers. */
export async function requireReportImageActor(write: boolean) {
  const session = await getCurrentSession();

  if (!session) {
    throw new ResponseError(401, loginMessage(write));
  }

  const membership = getActiveMembership(session);

  if (!membership) {
    throw new ResponseError(403, permissionMessage(write));
  }

  return toActor(session, membership.organizationId, membership.role, write);
}

/** Convert known report-image route errors into JSON responses. */
export function jsonError(error: unknown, fallback: string) {
  if (error instanceof ResponseError) {
    return NextResponse.json(
      { message: error.message, status: "error" },
      { status: error.status }
    );
  }

  if (isReportImageStatusError(error)) {
    return NextResponse.json(
      { message: error.message, status: "error" },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      message: fallback,
      status: "error",
    },
    { status: 500 }
  );
}

/** Parse route JSON and convert malformed bodies into a 400 response error. */
export async function parseJsonRequest(request: Request, message: string) {
  try {
    return await request.json();
  } catch {
    throw new ResponseError(400, message);
  }
}

/** HTTP-aware route error used by report-image API handlers. */
export class ResponseError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ResponseError";
  }
}

function isReportImageStatusError(
  error: unknown
): error is Error & { status: number } {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  );
}

function getActiveMembership(session: CurrentSession) {
  return session.memberships.find(
    (membership) =>
      membership.isActive && REPORT_IMAGE_READ_ROLES.includes(membership.role)
  );
}

function toActor(
  session: CurrentSession,
  organizationId: string,
  role: AppRole,
  write: boolean
): ReportImageActor {
  const canManage = role === "admin";

  if (write && !canManage) {
    throw new ResponseError(403, permissionMessage(true));
  }

  return {
    canManage,
    organizationId,
    profileId: session.profile.id,
  };
}

function permissionMessage(write: boolean) {
  return write
    ? "Bạn không có quyền tải ảnh báo cáo."
    : "Bạn không có quyền xem ảnh báo cáo.";
}

function loginMessage(write: boolean) {
  return write
    ? "Bạn cần đăng nhập để tải ảnh báo cáo."
    : "Bạn cần đăng nhập để xem ảnh báo cáo.";
}
