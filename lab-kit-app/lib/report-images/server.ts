import "server-only";

import {
  buildReportCloudinaryDeliveryUrl,
  destroyReportCloudinaryImage,
} from "./cloudinary";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  ReportImageDomainError,
  type ReportImage,
  type ReportImagesPort,
} from "./operations";

type ReportImageRow = {
  id: string;
  storage_bucket: string;
  storage_path: string;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

/** Create the Supabase-backed report image port. */
export function createSupabaseReportImagesPort(): ReportImagesPort {
  const supabase = getSupabaseAdminClient();

  return {
    async countReportImages(input) {
      const { count, error } = await supabase
        .from("report_images")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", input.organizationId);

      if (error) throw new Error("Không thể kiểm tra số lượng ảnh báo cáo.");
      return count ?? 0;
    },
    async findReportImageByPublicId(input) {
      const { data, error } = await supabase
        .from("report_images")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("storage_bucket", "cloudinary")
        .eq("storage_path", input.publicId)
        .maybeSingle<{ id: string }>();

      if (error) throw new Error("Không thể kiểm tra ảnh Cloudinary.");
      return data;
    },
    async findReportImageForDelete(input) {
      const { data, error } = await supabase
        .from("report_images")
        .select("storage_path")
        .eq("id", input.imageId)
        .eq("organization_id", input.organizationId)
        .maybeSingle<{ storage_path: string }>();

      if (error) throw new Error("Không thể kiểm tra ảnh báo cáo.");
      return data ? { publicId: data.storage_path } : null;
    },
    async listReportImages(input) {
      const { data, error } = await supabase
        .from("report_images")
        .select(
          "id, storage_bucket, storage_path, content_type, size_bytes, created_at"
        )
        .eq("organization_id", input.organizationId)
        .order("created_at", { ascending: false })
        .returns<ReportImageRow[]>();

      if (error) throw new Error("Không thể tải ảnh báo cáo.");
      return (data ?? []).map(mapReportImageRow);
    },
    async insertReportImageWithAudit(input) {
      const { data, error } = await supabase
        .rpc("create_report_image_with_audit", {
          p_actor_id: input.createdBy,
          p_audit_payload: input.auditEventPayload,
          p_content_type: input.contentType,
          p_organization_id: input.organizationId,
          p_size_bytes: input.sizeBytes,
          p_storage_bucket: input.storageBucket,
          p_storage_path: input.storagePath,
        })
        .returns<string>();

      if (error) {
        throw mapCreateReportImageError(error);
      }

      if (typeof data !== "string") {
        throw new Error("Không thể ghi nhận ảnh báo cáo.");
      }

      return { imageId: data };
    },
    async deleteReportImageRecordWithAudit(input) {
      const { error } = await supabase.rpc("delete_report_image_with_audit", {
        p_actor_id: input.actorId,
        p_audit_payload: input.eventPayload,
        p_image_id: input.imageId,
        p_organization_id: input.organizationId,
      });

      if (error) throw new Error("Không thể xóa ảnh báo cáo.");
    },
    deleteCloudinaryImage: destroyReportCloudinaryImage,
  };
}

function mapCreateReportImageError(error: { message?: string }) {
  if (error.message === "report image limit reached") {
    return new ReportImageDomainError(
      409,
      "Gallery đang có đủ 20 ảnh. Hãy xóa bớt ảnh trước khi tải thêm."
    );
  }

  return new Error("Không thể ghi nhận ảnh báo cáo.");
}

function mapReportImageRow(row: ReportImageRow): ReportImage {
  const cloudName = row.storage_bucket.startsWith("cloudinary:")
    ? row.storage_bucket.slice("cloudinary:".length)
    : process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("Thiếu cấu hình Cloudinary.");
  }

  return {
    contentType: row.content_type ?? "image/jpeg",
    createdAt: row.created_at,
    id: row.id,
    publicId: row.storage_path,
    secureUrl: buildReportCloudinaryDeliveryUrl({
      cloudName,
      publicId: row.storage_path,
    }),
    sizeBytes: row.size_bytes ?? 0,
  };
}
