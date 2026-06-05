import type {
  GroupInput,
  MetricInput,
  TemplateInput,
  TemplateMetricInput,
} from "./schemas";

export type ResultConfigurationActor = {
  profileId: string;
  organizationId: string;
};

export type ResultConfigurationAuditInput = {
  organizationId: string;
  actorId: string;
  action:
    | "result_group.created"
    | "result_group.updated"
    | "result_metric.created"
    | "result_metric.updated"
    | "result_template.created"
    | "result_template.updated"
    | "result_template_metrics.replaced";
  entityTable:
    | "result_groups"
    | "result_metrics"
    | "result_templates"
    | "result_template_metrics";
  entityId: string;
  eventPayload: Record<string, unknown>;
};

export type ResultConfigurationPort = {
  createGroup(
    input: GroupInput & { organizationId: string; actorId: string }
  ): Promise<{ groupId: string }>;
  updateGroup(
    input: GroupInput & {
      groupId: string;
      organizationId: string;
      actorId: string;
    }
  ): Promise<void>;
  createMetric(
    input: MetricInput & { organizationId: string; actorId: string }
  ): Promise<{ metricId: string }>;
  updateMetric(
    input: MetricInput & {
      metricId: string;
      organizationId: string;
      actorId: string;
    }
  ): Promise<void>;
  createTemplate(
    input: TemplateInput & { organizationId: string; actorId: string }
  ): Promise<{ templateId: string }>;
  updateTemplate(
    input: TemplateInput & {
      templateId: string;
      organizationId: string;
      actorId: string;
    }
  ): Promise<void>;
  replaceTemplateMetrics(
    input: TemplateMetricInput & { organizationId: string; actorId: string }
  ): Promise<void>;
};

export async function createResultGroup(
  input: GroupInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  const result = await port.createGroup({
    ...input,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });

  return result;
}

export async function updateResultGroup(
  groupId: string,
  input: GroupInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  await port.updateGroup({
    ...input,
    groupId,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });
}

export async function createResultMetric(
  input: MetricInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  const result = await port.createMetric({
    ...input,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });

  return result;
}

export async function updateResultMetric(
  metricId: string,
  input: MetricInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  await port.updateMetric({
    ...input,
    metricId,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });
}

export async function createResultTemplate(
  input: TemplateInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  const result = await port.createTemplate({
    ...input,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });

  return result;
}

export async function updateResultTemplate(
  templateId: string,
  input: TemplateInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  await port.updateTemplate({
    ...input,
    templateId,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });
}

export async function replaceTemplateMetrics(
  input: TemplateMetricInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  await port.replaceTemplateMetrics({
    ...input,
    organizationId: actor.organizationId,
    actorId: actor.profileId,
  });
}
