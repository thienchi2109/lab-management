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
  ResultConfigurationAuditInput,
  ResultConfigurationPort,
} from "./operations";

export function getResultConfigurationActor(
  session: CurrentSession
): ResultConfigurationActor | null {
  const membership = session.memberships.find((item) => {
    return item.role === "admin" && item.isActive;
  });

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

  if (
    groups.error ||
    metrics.error ||
    sampleTypes.error ||
    templates.error ||
    templateMetrics.error
  ) {
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
      const { data, error } = await supabase
        .from("result_groups")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          sort_order: input.sortOrder,
          is_active: input.isActive,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) {
        throw new Error("Could not create result group.");
      }

      return { groupId: data.id };
    },
    async updateGroup(input) {
      const { error } = await supabase
        .from("result_groups")
        .update({
          code: input.code,
          name: input.name,
          sort_order: input.sortOrder,
          is_active: input.isActive,
        })
        .eq("id", input.groupId)
        .eq("organization_id", input.organizationId);

      if (error) {
        throw new Error("Could not update result group.");
      }
    },
    async createMetric(input) {
      const { data, error } = await supabase
        .from("result_metrics")
        .insert({
          organization_id: input.organizationId,
          result_group_id: input.resultGroupId,
          code: input.code,
          name: input.name,
          input_type: input.inputType,
          unit: input.unit,
          options: input.options,
          metric_settings: input.metricSettings,
          sort_order: input.sortOrder,
          is_required: input.isRequired,
          is_active: input.isActive,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) {
        throw new Error("Could not create result metric.");
      }

      return { metricId: data.id };
    },
    async updateMetric(input) {
      const { error } = await supabase
        .from("result_metrics")
        .update({
          result_group_id: input.resultGroupId,
          code: input.code,
          name: input.name,
          input_type: input.inputType,
          unit: input.unit,
          options: input.options,
          metric_settings: input.metricSettings,
          sort_order: input.sortOrder,
          is_required: input.isRequired,
          is_active: input.isActive,
        })
        .eq("id", input.metricId)
        .eq("organization_id", input.organizationId);

      if (error) {
        throw new Error("Could not update result metric.");
      }
    },
    async createTemplate(input) {
      const { data, error } = await supabase
        .from("result_templates")
        .insert({
          organization_id: input.organizationId,
          sample_type_id: input.sampleTypeId,
          code: input.code,
          name: input.name,
          is_active: input.isActive,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) {
        throw new Error("Could not create result template.");
      }

      return { templateId: data.id };
    },
    async updateTemplate(input) {
      const { error } = await supabase
        .from("result_templates")
        .update({
          sample_type_id: input.sampleTypeId,
          code: input.code,
          name: input.name,
          is_active: input.isActive,
        })
        .eq("id", input.templateId)
        .eq("organization_id", input.organizationId);

      if (error) {
        throw new Error("Could not update result template.");
      }
    },
    async replaceTemplateMetrics(input) {
      await replaceTemplateMetricRows(supabase, input);
    },
    async insertAuditEvent(input: ResultConfigurationAuditInput) {
      const { error } = await supabase.from("audit_events").insert({
        organization_id: input.organizationId,
        actor_id: input.actorId,
        action: input.action,
        entity_table: input.entityTable,
        entity_id: input.entityId,
        event_payload: input.eventPayload,
      });

      if (error) {
        throw new Error("Could not record audit event.");
      }
    },
  };
}

async function replaceTemplateMetricRows(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  input: {
    resultTemplateId: string;
    metricIds: string[];
    organizationId: string;
  }
) {
  const { error: deleteError } = await supabase
    .from("result_template_metrics")
    .delete()
    .eq("result_template_id", input.resultTemplateId)
    .eq("organization_id", input.organizationId);

  if (deleteError) {
    throw new Error("Could not replace template metrics.");
  }

  if (input.metricIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("result_template_metrics")
    .insert(
      input.metricIds.map((metricId, index) => ({
        organization_id: input.organizationId,
        result_template_id: input.resultTemplateId,
        result_metric_id: metricId,
        sort_order: (index + 1) * 10,
      }))
    );

  if (insertError) {
    throw new Error("Could not replace template metrics.");
  }
}
