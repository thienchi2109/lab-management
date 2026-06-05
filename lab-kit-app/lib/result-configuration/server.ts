import "server-only";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/auth/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type {
  ResultGroupRow,
  ResultMetricRow,
  ResultTemplateMetricRow,
  ResultTemplateRow,
  SampleTypeRow,
} from "./configuration";
import {
  mapResultConfigurationRows,
  type ResultConfiguration,
} from "./configuration";
import type {
  ResultConfigurationActor,
  ResultConfigurationPort,
} from "./operations";

export function getResultConfigurationActor(
  session: CurrentSession
): ResultConfigurationActor | null {
  const membership = session.memberships.find(
    (item) => item.role === "admin" && item.isActive
  );

  if (!membership) {
    return null;
  }

  return {
    profileId: session.profile.id,
    organizationId: membership.organizationId,
  };
}

export async function requireResultConfigurationActor() {
  const session = await getCurrentSession();

  if (!session || !hasAnyRole(session.memberships, ["admin"])) {
    throw new Error("Admin access required.");
  }

  const actor = getResultConfigurationActor(session);

  if (!actor) {
    throw new Error("Admin access required.");
  }

  return actor;
}

export async function getResultConfiguration(): Promise<ResultConfiguration> {
  const actor = await requireResultConfigurationActor();
  const supabase = getSupabaseAdminClient();

  const [groups, metrics, sampleTypes, templates, templateMetrics] =
    await Promise.all([
      supabase
        .from("result_groups")
        .select(
          "id, organization_id, code, name, sort_order, is_active, created_at, updated_at"
        )
        .eq("organization_id", actor.organizationId)
        .order("sort_order", { ascending: true })
        .returns<ResultGroupRow[]>(),
      supabase
        .from("result_metrics")
        .select(
          "id, organization_id, result_group_id, code, name, input_type, unit, options, metric_settings, sort_order, is_required, is_active, created_at, updated_at"
        )
        .eq("organization_id", actor.organizationId)
        .order("sort_order", { ascending: true })
        .returns<ResultMetricRow[]>(),
      supabase
        .from("sample_types")
        .select("id, code, name, is_active")
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true })
        .returns<SampleTypeRow[]>(),
      supabase
        .from("result_templates")
        .select(
          "id, organization_id, sample_type_id, code, name, is_active, created_at, updated_at"
        )
        .eq("organization_id", actor.organizationId)
        .order("name", { ascending: true })
        .returns<ResultTemplateRow[]>(),
      supabase
        .from("result_template_metrics")
        .select(
          "id, organization_id, result_template_id, result_metric_id, sort_order, created_at"
        )
        .eq("organization_id", actor.organizationId)
        .order("sort_order", { ascending: true })
        .returns<ResultTemplateMetricRow[]>(),
    ]);

  const primaryError =
    groups.error ||
    metrics.error ||
    sampleTypes.error ||
    templates.error ||
    templateMetrics.error;
  if (primaryError) {
    console.error("Failed to fetch result configuration:", primaryError);
    throw new Error("Could not load result configuration.");
  }

  return mapResultConfigurationRows({
    groups: groups.data ?? [],
    metrics: metrics.data ?? [],
    sampleTypes: sampleTypes.data ?? [],
    templates: templates.data ?? [],
    templateMetrics: templateMetrics.data ?? [],
  });
}

export function createSupabaseResultConfigurationPort(): ResultConfigurationPort {
  const supabase = getSupabaseAdminClient();

  return {
    async createGroup(input) {
      const { data, error } = await supabase.rpc(
        "create_result_group_with_audit",
        {
          p_organization_id: input.organizationId,
          p_actor_id: input.actorId,
          p_code: input.code,
          p_name: input.name,
          p_sort_order: input.sortOrder,
          p_is_active: input.isActive,
        }
      );

      if (error || typeof data !== "string") {
        throw new Error("Could not create result group.");
      }

      return { groupId: data };
    },
    async updateGroup(input) {
      const { error } = await supabase.rpc("update_result_group_with_audit", {
        p_organization_id: input.organizationId,
        p_actor_id: input.actorId,
        p_group_id: input.groupId,
        p_code: input.code,
        p_name: input.name,
        p_sort_order: input.sortOrder,
        p_is_active: input.isActive,
      });

      if (error) {
        throw new Error("Could not update result group.");
      }
    },
    async createMetric(input) {
      const { data, error } = await supabase.rpc(
        "create_result_metric_with_audit",
        {
          p_organization_id: input.organizationId,
          p_actor_id: input.actorId,
          p_result_group_id: input.resultGroupId,
          p_code: input.code,
          p_name: input.name,
          p_input_type: input.inputType,
          p_unit: input.unit,
          p_options: input.options,
          p_metric_settings: input.metricSettings,
          p_sort_order: input.sortOrder,
          p_is_required: input.isRequired,
          p_is_active: input.isActive,
        }
      );

      if (error || typeof data !== "string") {
        throw new Error("Could not create result metric.");
      }

      return { metricId: data };
    },
    async updateMetric(input) {
      const { error } = await supabase.rpc("update_result_metric_with_audit", {
        p_organization_id: input.organizationId,
        p_actor_id: input.actorId,
        p_metric_id: input.metricId,
        p_result_group_id: input.resultGroupId,
        p_code: input.code,
        p_name: input.name,
        p_input_type: input.inputType,
        p_unit: input.unit,
        p_options: input.options,
        p_metric_settings: input.metricSettings,
        p_sort_order: input.sortOrder,
        p_is_required: input.isRequired,
        p_is_active: input.isActive,
      });

      if (error) {
        throw new Error("Could not update result metric.");
      }
    },
    async createTemplate(input) {
      const { data, error } = await supabase.rpc(
        "create_result_template_with_audit",
        {
          p_organization_id: input.organizationId,
          p_actor_id: input.actorId,
          p_sample_type_id: input.sampleTypeId,
          p_code: input.code,
          p_name: input.name,
          p_is_active: input.isActive,
        }
      );

      if (error || typeof data !== "string") {
        throw new Error("Could not create result template.");
      }

      return { templateId: data };
    },
    async updateTemplate(input) {
      const { error } = await supabase.rpc(
        "update_result_template_with_audit",
        {
          p_organization_id: input.organizationId,
          p_actor_id: input.actorId,
          p_template_id: input.templateId,
          p_sample_type_id: input.sampleTypeId,
          p_code: input.code,
          p_name: input.name,
          p_is_active: input.isActive,
        }
      );

      if (error) {
        throw new Error("Could not update result template.");
      }
    },
    async replaceTemplateMetrics(input) {
      const { error } = await supabase.rpc(
        "replace_result_template_metrics_with_audit",
        {
          p_organization_id: input.organizationId,
          p_actor_id: input.actorId,
          p_result_template_id: input.resultTemplateId,
          p_metric_ids: input.metricIds,
        }
      );

      if (error) {
        throw new Error("Could not replace template metrics.");
      }
    },
  };
}
