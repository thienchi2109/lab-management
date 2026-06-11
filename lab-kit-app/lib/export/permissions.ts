import type { AppRole } from "@/lib/auth/permissions";
import type { CurrentSession } from "@/lib/auth/session";

/** Permission sản phẩm cho chức năng Export Excel/CSV. */
export const EXPORT_EXCEL_CSV_PERMISSION = "export:excel-csv";

/** Grant quyền export được caller truyền vào sau khi đã đọc từ nguồn tin cậy. */
export type ExportPermissionGrant = {
  isActive: boolean;
  organizationId: string;
  permission: typeof EXPORT_EXCEL_CSV_PERMISSION;
};

/** Actor đã vượt qua permission gate export và được scope theo tenant. */
export type ExportActor = {
  organizationId: string;
  profileId: string;
  role: AppRole;
};

/** Input để resolve actor export mà không phụ thuộc vào schema grant cụ thể. */
export type ResolveExportActorInput = {
  grants?: readonly ExportPermissionGrant[];
  organizationId: string;
  session: CurrentSession | null;
};

/** Resolve actor export theo role, grant Viewer và tenant scope bắt buộc. */
export function resolveExportActor(
  input: ResolveExportActorInput
): ExportActor | null {
  const membership = input.session?.memberships.find((item) => {
    return (
      item.isActive &&
      item.organizationId === input.organizationId &&
      (item.role === "admin" ||
        item.role === "editor" ||
        item.role === "viewer")
    );
  });

  if (!input.session || !membership) {
    return null;
  }

  if (
    membership.role === "viewer" &&
    !hasViewerExportGrant(input.grants ?? [], input.organizationId)
  ) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    profileId: input.session.profile.id,
    role: membership.role,
  };
}

function hasViewerExportGrant(
  grants: readonly ExportPermissionGrant[],
  organizationId: string
) {
  return grants.some((grant) => {
    return (
      grant.isActive &&
      grant.organizationId === organizationId &&
      grant.permission === EXPORT_EXCEL_CSV_PERMISSION
    );
  });
}
