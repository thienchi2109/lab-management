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
    async insertSampleImage(input) {
      const { data, error } = await supabase
        .from("sample_images")
        .insert({
          content_type: input.contentType,
          created_by: input.createdBy,
          organization_id: input.organizationId,
          sample_id: input.sampleId,
          size_bytes: input.sizeBytes,
          storage_bucket: input.storageBucket,
          storage_path: input.storagePath,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) throw new Error("Không thể ghi nhận ảnh minh chứng.");
      return { imageId: data.id };
    },
    async deleteSampleImageRecord(input) {
      const { data, error } = await supabase
        .from("sample_images")
        .delete()
        .eq("id", input.imageId)
        .eq("sample_id", input.sampleId)
        .eq("organization_id", input.organizationId)
        .select("storage_path")
        .maybeSingle<{ storage_path: string }>();

      if (error) throw new Error("Không thể xóa ảnh minh chứng.");
      return data ? { publicId: data.storage_path } : null;
    },
    async insertAuditEvent(input) {
      const { error } = await supabase.from("audit_events").insert({
        action: input.action,
        actor_id: input.actorId,
        entity_id: input.entityId,
        entity_table: input.entityTable,
        event_payload: input.eventPayload,
        organization_id: input.organizationId,
      });

      if (error) throw new Error("Không thể ghi audit ảnh minh chứng.");
    },
    deleteCloudinaryImage: destroyCloudinaryImage,
  };
}

function mapSampleImageRow(row: SampleImageRow): SampleImage {
  const cloudName = row.storage_bucket.startsWith("cloudinary:")
    ? row.storage_bucket.slice("cloudinary:".length)
    : process.env.CLOUDINARY_CLOUD_NAME;

  return {
    id: row.id,
    contentType: row.content_type ?? "image/jpeg",
    createdAt: row.created_at,
    publicId: row.storage_path,
    secureUrl: cloudName
      ? buildCloudinaryDeliveryUrl({
          cloudName,
          publicId: row.storage_path,
        })
      : "",
    sizeBytes: row.size_bytes ?? 0,
  };
}
