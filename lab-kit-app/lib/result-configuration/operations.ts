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
    input: GroupInput & { organizationId: string }
  ): Promise<{ groupId: string }>;
  updateGroup(
    input: GroupInput & { groupId: string; organizationId: string }
  ): Promise<void>;
  createMetric(
    input: MetricInput & { organizationId: string }
  ): Promise<{ metricId: string }>;
  updateMetric(
    input: MetricInput & { metricId: string; organizationId: string }
  ): Promise<void>;
  createTemplate(
    input: TemplateInput & { organizationId: string }
  ): Promise<{ templateId: string }>;
  updateTemplate(
    input: TemplateInput & { templateId: string; organizationId: string }
  ): Promise<void>;
  replaceTemplateMetrics(
    input: TemplateMetricInput & { organizationId: string }
  ): Promise<void>;
  insertAuditEvent(input: ResultConfigurationAuditInput): Promise<void>;
};

export async function createResultGroup(
  input: GroupInput,
  actor: ResultConfigurationActor,
  port: ResultConfigurationPort
) {
  const result = await port.createGroup({
    ...input,
    organizationId: actor.organizationId,
  });

  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_group.created",
    entityTable: "result_groups",
    entityId: result.groupId,
    eventPayload: input,
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
  });
  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_group.updated",
    entityTable: "result_groups",
    entityId: groupId,
    eventPayload: input,
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
  });

  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_metric.created",
    entityTable: "result_metrics",
    entityId: result.metricId,
    eventPayload: input,
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
  });
  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_metric.updated",
    entityTable: "result_metrics",
    entityId: metricId,
    eventPayload: input,
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
  });

  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_template.created",
    entityTable: "result_templates",
    entityId: result.templateId,
    eventPayload: input,
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
  });
  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_template.updated",
    entityTable: "result_templates",
    entityId: templateId,
    eventPayload: input,
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
  });
  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "result_template_metrics.replaced",
    entityTable: "result_template_metrics",
    entityId: input.resultTemplateId,
    eventPayload: { metricIds: input.metricIds },
  });
}
