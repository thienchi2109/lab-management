import "server-only";

import {
  buildCloudinaryDeliveryUrl,
  destroyCloudinaryImage,
} from "./cloudinary";
import type { SampleImage, SampleImagesPort } from "./operations";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SampleImageRow = {
  id: string;
  storage_bucket: string;
  storage_path: string;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

/** Create the Supabase-backed sample image port. */
export function createSupabaseSampleImagesPort(): SampleImagesPort {
  const supabase = getSupabaseAdminClient();

  return {
    async sampleBelongsToOrganization(input) {
      const { data, error } = await supabase
        .from("samples")
        .select("id")
        .eq("id", input.sampleId)
        .eq("organization_id", input.organizationId)
        .maybeSingle<{ id: string }>();

      if (error) throw new Error("Không thể kiểm tra mẫu xét nghiệm.");
      return Boolean(data);
    },
    async countImagesForSample(input) {
      const { count, error } = await supabase
        .from("sample_images")
        .select("id", { count: "exact", head: true })
        .eq("sample_id", input.sampleId)
        .eq("organization_id", input.organizationId);

      if (error) throw new Error("Không thể kiểm tra số lượng ảnh.");
      return count ?? 0;
    },
    async findSampleImageByPublicId(input) {
      const { data, error } = await supabase
        .from("sample_images")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("storage_bucket", "cloudinary")
        .eq("storage_path", input.publicId)
        .maybeSingle<{ id: string }>();

      if (error) throw new Error("Không thể kiểm tra ảnh Cloudinary.");
      return data;
    },
    async findSampleImageForDelete(input) {
      const { data, error } = await supabase
        .from("sample_images")
        .select("storage_path")
        .eq("id", input.imageId)
        .eq("sample_id", input.sampleId)
        .eq("organization_id", input.organizationId)
        .maybeSingle<{ storage_path: string }>();

      if (error) throw new Error("Không thể kiểm tra ảnh minh chứng.");
      return data ? { publicId: data.storage_path } : null;
    },
    async listSampleImages(input) {
      const { data, error } = await supabase
        .from("sample_images")
        .select(
          "id, storage_bucket, storage_path, content_type, size_bytes, created_at"
        )
        .eq("sample_id", input.sampleId)
        .eq("organization_id", input.organizationId)
        .order("created_at", { ascending: false })
        .returns<SampleImageRow[]>();

      if (error) throw new Error("Không thể tải ảnh minh chứng.");
      return (data ?? []).map(mapSampleImageRow);
    },
    async insertSampleImageWithAudit(input) {
      const { data, error } = await supabase
        .rpc("create_sample_image_with_audit", {
          p_actor_id: input.createdBy,
          p_audit_payload: input.auditEventPayload,
          p_content_type: input.contentType,
          p_organization_id: input.organizationId,
          p_sample_id: input.sampleId,
          p_size_bytes: input.sizeBytes,
          p_storage_bucket: input.storageBucket,
          p_storage_path: input.storagePath,
        })
        .returns<string>();

      if (error || typeof data !== "string") {
        throw new Error("Không thể ghi nhận ảnh minh chứng.");
      }

      return { imageId: data };
    },
    async deleteSampleImageRecordWithAudit(input) {
      const { error } = await supabase.rpc("delete_sample_image_with_audit", {
        p_actor_id: input.actorId,
        p_audit_payload: input.eventPayload,
        p_image_id: input.imageId,
        p_organization_id: input.organizationId,
        p_sample_id: input.sampleId,
      });

      if (error) throw new Error("Không thể xóa ảnh minh chứng.");
    },
    deleteCloudinaryImage: destroyCloudinaryImage,
  };
}

function mapSampleImageRow(row: SampleImageRow): SampleImage {
  const cloudName = row.storage_bucket.startsWith("cloudinary:")
    ? row.storage_bucket.slice("cloudinary:".length)
    : process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("Thiếu cấu hình Cloudinary.");
  }

  return {
    id: row.id,
    contentType: row.content_type ?? "image/jpeg",
    createdAt: row.created_at,
    publicId: row.storage_path,
    secureUrl: buildCloudinaryDeliveryUrl({
      cloudName,
      publicId: row.storage_path,
    }),
    sizeBytes: row.size_bytes ?? 0,
  };
}
