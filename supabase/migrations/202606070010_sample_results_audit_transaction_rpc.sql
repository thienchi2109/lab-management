-- US-007: atomically save dynamic sample results, group conclusions, and audit.

create or replace function public.save_sample_results_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_sample_id uuid,
  p_results jsonb,
  p_conclusions jsonb,
  p_audit_event jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sample_type uuid;
  template_id uuid;
  result_item jsonb;
  conclusion_item jsonb;
  metric_id uuid;
  group_id uuid;
begin
  if p_organization_id is null or p_actor_id is null or p_sample_id is null then
    raise exception 'organization_id, actor_id, and sample_id are required';
  end if;

  select sample_type_id
  into sample_type
  from public.samples
  where id = p_sample_id
    and organization_id = p_organization_id;

  if sample_type is null then
    raise exception 'sample does not belong to organization';
  end if;

  select id
  into template_id
  from public.result_templates
  where organization_id = p_organization_id
    and sample_type_id = sample_type
    and is_active = true
  order by created_at desc
  limit 1;

  if template_id is null then
    raise exception 'sample has no active result template';
  end if;

  for result_item in select * from jsonb_array_elements(coalesce(p_results, '[]'::jsonb))
  loop
    metric_id := (result_item ->> 'metricId')::uuid;

    if not exists (
      select 1
      from public.result_template_metrics rtm
      join public.result_metrics rm on rm.id = rtm.result_metric_id
      where rtm.organization_id = p_organization_id
        and rtm.result_template_id = template_id
        and rtm.result_metric_id = metric_id
        and rm.is_active = true
    ) then
      raise exception 'result metric does not belong to active sample template';
    end if;

    insert into public.sample_results (
      organization_id,
      sample_id,
      result_metric_id,
      value,
      entered_by
    )
    values (
      p_organization_id,
      p_sample_id,
      metric_id,
      result_item -> 'value',
      p_actor_id
    )
    on conflict (sample_id, result_metric_id)
    do update set
      value = excluded.value,
      entered_by = excluded.entered_by,
      updated_at = now();
  end loop;

  for conclusion_item in select * from jsonb_array_elements(coalesce(p_conclusions, '[]'::jsonb))
  loop
    group_id := (conclusion_item ->> 'groupId')::uuid;

    if not exists (
      select 1
      from public.result_template_metrics rtm
      join public.result_metrics rm on rm.id = rtm.result_metric_id
      where rtm.organization_id = p_organization_id
        and rtm.result_template_id = template_id
        and rm.result_group_id = group_id
        and rm.is_active = true
    ) then
      raise exception 'result group does not belong to active sample template';
    end if;

    insert into public.sample_group_conclusions (
      organization_id,
      sample_id,
      result_group_id,
      kq_chung,
      calculated_from
    )
    values (
      p_organization_id,
      p_sample_id,
      group_id,
      conclusion_item ->> 'kqChung',
      coalesce(conclusion_item -> 'calculatedFrom', '{}'::jsonb)
    )
    on conflict (sample_id, result_group_id)
    do update set
      kq_chung = excluded.kq_chung,
      calculated_from = excluded.calculated_from,
      updated_at = now();
  end loop;

  insert into public.audit_events (
    organization_id,
    actor_id,
    action,
    entity_table,
    entity_id,
    event_payload
  )
  values (
    p_organization_id,
    p_actor_id,
    coalesce(p_audit_event ->> 'action', 'sample_results.updated'),
    coalesce(p_audit_event ->> 'entityTable', 'sample_results'),
    p_sample_id,
    coalesce(p_audit_event -> 'eventPayload', '{}'::jsonb)
  );
end;
$$;

revoke all on function public.save_sample_results_with_audit(
  uuid, uuid, uuid, jsonb, jsonb, jsonb
) from public;
revoke all on function public.save_sample_results_with_audit(
  uuid, uuid, uuid, jsonb, jsonb, jsonb
) from anon;
revoke all on function public.save_sample_results_with_audit(
  uuid, uuid, uuid, jsonb, jsonb, jsonb
) from authenticated;
grant execute on function public.save_sample_results_with_audit(
  uuid, uuid, uuid, jsonb, jsonb, jsonb
) to service_role;
