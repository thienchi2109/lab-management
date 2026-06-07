import "server-only";

import { notFound } from "next/navigation";

import { hasAnyRole, type AppRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getSampleImages } from "@/lib/sample-images/operations";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";
import {
  getSampleResultEntry,
  type SampleResultActor,
} from "@/lib/sample-results/operations";
import { createSupabaseSampleResultsPort } from "@/lib/sample-results/server";

import { SampleResultsClient } from "./_components/sample-results-client";

type SampleResultsPageProps = {
  params: Promise<{ sampleId: string }>;
};

/** Render route nhập kết quả động cho một mẫu xét nghiệm. */
export default async function SampleResultsPage({
  params,
}: SampleResultsPageProps) {
  const [routeParams, actor] = await Promise.all([params, getActorOrNull()]);

  if (!actor) {
    notFound();
  }

  const [entry, images] = await Promise.all([
    loadEntryOrNull(routeParams.sampleId, actor),
    loadImagesOrEmpty(routeParams.sampleId, actor),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <SampleResultsClient
      canWrite={actor.canWrite}
      entry={entry}
      initialImages={images}
    />
  );
}

async function loadEntryOrNull(sampleId: string, actor: SampleResultActor) {
  try {
    return await getSampleResultEntry(
      sampleId,
      actor,
      createSupabaseSampleResultsPort()
    );
  } catch {
    return null;
  }
}

async function loadImagesOrEmpty(sampleId: string, actor: SampleResultActor) {
  try {
    return await getSampleImages(
      sampleId,
      actor,
      createSupabaseSampleImagesPort()
    );
  } catch {
    return [];
  }
}

async function getActorOrNull(): Promise<SampleResultActor | null> {
  const session = await getCurrentSession();

  if (!session || !hasAnyRole(session.memberships, allowedRoles)) {
    return null;
  }

  const membership = getActiveMembership(session);

  if (!membership) {
    return null;
  }

  return {
    profileId: session.profile.id,
    organizationId: membership.organizationId,
    canWrite: membership.role === "admin" || membership.role === "editor",
  };
}

function getActiveMembership(session: CurrentSession) {
  return session.memberships.find(
    (membership) =>
      membership.isActive && allowedRoles.includes(membership.role)
  );
}

const allowedRoles: AppRole[] = ["admin", "editor", "viewer"];
