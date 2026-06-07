import { NextResponse } from "next/server";

import { hasAnyRole, type AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";

import type { SampleImageActor } from "./operations";

/** Resolve the active sample image actor for image API route handlers. */
export async function requireSampleImageActor(write: boolean) {
  const session = await getCurrentSession();

  if (!session) {
    throw new ResponseError(401, loginMessage(write));
  }

  const allowed: AppRole[] = write
    ? ["admin", "editor"]
    : ["admin", "editor", "viewer"];

  if (!hasAnyRole(session.memberships, allowed)) {
    throw new ResponseError(403, permissionMessage(write));
  }

  const membership = getActiveMembership(session, allowed);

  if (!membership) {
    throw new ResponseError(403, permissionMessage(write));
  }

  return toActor(session, membership.organizationId, membership.role, write);
}

/** Convert known sample-image route errors into JSON responses. */
export function jsonError(error: unknown, fallback: string) {
  if (error instanceof ResponseError) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      status: "error",
      message: fallback,
    },
    { status: 500 }
  );
}

/** HTTP-aware route error used by sample-image API handlers. */
export class ResponseError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ResponseError";
  }
}

function getActiveMembership(session: CurrentSession, allowed: AppRole[]) {
  return session.memberships.find(
    (membership) => membership.isActive && allowed.includes(membership.role)
  );
}

function toActor(
  session: CurrentSession,
  organizationId: string,
  role: AppRole,
  write: boolean
): SampleImageActor {
  const canWrite = role === "admin" || role === "editor";

  if (write && !canWrite) {
    throw new ResponseError(403, permissionMessage(true));
  }

  return {
    canWrite,
    organizationId,
    profileId: session.profile.id,
  };
}

function permissionMessage(write: boolean) {
  return write
    ? "Bạn không có quyền tải ảnh minh chứng."
    : "Bạn không có quyền xem ảnh minh chứng.";
}

function loginMessage(write: boolean) {
  return write
    ? "Bạn cần đăng nhập để tải ảnh minh chứng."
    : "Bạn cần đăng nhập để xem ảnh minh chứng.";
}
