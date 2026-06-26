import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { AnalyticsActor } from "./operations";
import {
  buildReportKitPresetAuditPayload,
  parseReportKitFilterPresetConfig,
  REPORT_KIT_FILTER_PRESET_SCOPE,
  type ReportKitFilterPreset,
  type ReportKitFilterPresetConfig,
} from "./report-kit-presets";

type ReportKitFilterPresetRow = {
  config: unknown;
  updated_at: string;
  updated_by: string | null;
};

/** Dữ liệu đầu vào để lưu preset báo cáo cho tổ chức của actor. */
export type SaveReportKitFilterPresetInput = {
  actor: AnalyticsActor;
  config: ReportKitFilterPresetConfig;
};

/** Dữ liệu đầu vào để đọc preset báo cáo theo actor đã xác thực. */
export type ReadReportKitFilterPresetInput = {
  actor: AnalyticsActor;
};

/** Port lưu preset báo cáo với actor đã xác thực ở tầng ứng dụng. */
export type ReportKitFilterPresetPort = {
  readPreset(
    input: ReadReportKitFilterPresetInput
  ): Promise<ReportKitFilterPreset | null>;
  savePreset(
    input: SaveReportKitFilterPresetInput
  ): Promise<ReportKitFilterPreset>;
};

/** Tạo port Supabase đọc/ghi preset bộ lọc báo cáo kèm audit transaction. */
export function createSupabaseReportKitPresetPort(): ReportKitFilterPresetPort {
  const supabase = getSupabaseAdminClient();

  return {
    async readPreset(input) {
      const { data, error } = await supabase
        .from("report_filter_presets")
        .select("config, updated_at, updated_by")
        .eq("organization_id", input.actor.organizationId)
        .eq("scope", REPORT_KIT_FILTER_PRESET_SCOPE)
        .maybeSingle<ReportKitFilterPresetRow>();

      if (error) {
        throw new Error("Không thể tải preset bộ lọc báo cáo.");
      }

      return data ? mapPresetRow(data) : null;
    },
    async savePreset(input) {
      const { data, error } = await supabase
        .rpc("upsert_report_filter_preset_with_audit", {
          p_actor_id: input.actor.profileId,
          p_audit_event_payload: buildReportKitPresetAuditPayload(input.config),
          p_config: input.config,
          p_organization_id: input.actor.organizationId,
          p_scope: REPORT_KIT_FILTER_PRESET_SCOPE,
        })
        .single<ReportKitFilterPresetRow>();

      if (error || !data) {
        throw new Error("Không thể lưu preset bộ lọc báo cáo.");
      }

      return mapPresetRow(data);
    },
  };
}

function mapPresetRow(row: ReportKitFilterPresetRow): ReportKitFilterPreset {
  return {
    config: parseReportKitFilterPresetConfig(row.config),
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}
