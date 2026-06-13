-- Issue #31 follow-up: deduplicate repeated JSON payload keys before upsert.

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

  if exists (
    with raw_results as (
      select (payload.item ->> 'metricId')::uuid as metric_id
      from jsonb_array_elements(coalesce(p_results, '[]'::jsonb))
        with ordinality as payload(item, item_ordinal)
    ),
    valid_template_metrics as (
      select rtm.result_metric_id
      from public.result_template_metrics rtm
      join public.result_metrics rm on rm.id = rtm.result_metric_id
      where rtm.organization_id = p_organization_id
        and rtm.result_template_id = template_id
        and rm.is_active = true
    )
    select 1
    from raw_results rr
    left join valid_template_metrics vtm
      on vtm.result_metric_id = rr.metric_id
    where vtm.result_metric_id is null
  ) then
    raise exception 'result metric does not belong to active sample template';
  end if;

  with raw_results as (
    select
      (payload.item ->> 'metricId')::uuid as metric_id,
      payload.item -> 'value' as value,
      payload.item_ordinal
    from jsonb_array_elements(coalesce(p_results, '[]'::jsonb))
      with ordinality as payload(item, item_ordinal)
  ),
  parsed_results as (
    select distinct on (metric_id)
      metric_id,
      value
    from raw_results
    order by metric_id, item_ordinal desc
  )
  insert into public.sample_results (
    organization_id,
    sample_id,
    result_metric_id,
    value,
    entered_by
  )
  select
    p_organization_id,
    p_sample_id,
    parsed_results.metric_id,
    parsed_results.value,
    p_actor_id
  from parsed_results
  on conflict (sample_id, result_metric_id)
  do update set
    value = excluded.value,
    entered_by = excluded.entered_by,
    updated_at = now();

  if exists (
    with raw_conclusions as (
      select (payload.item ->> 'groupId')::uuid as group_id
      from jsonb_array_elements(coalesce(p_conclusions, '[]'::jsonb))
        with ordinality as payload(item, item_ordinal)
    ),
    valid_template_groups as (
      select distinct rm.result_group_id
      from public.result_template_metrics rtm
      join public.result_metrics rm on rm.id = rtm.result_metric_id
      where rtm.organization_id = p_organization_id
        and rtm.result_template_id = template_id
        and rm.is_active = true
    )
    select 1
    from raw_conclusions rc
    left join valid_template_groups vtg
      on vtg.result_group_id = rc.group_id
    where vtg.result_group_id is null
  ) then
    raise exception 'result group does not belong to active sample template';
  end if;

  with raw_conclusions as (
    select
      (payload.item ->> 'groupId')::uuid as group_id,
      payload.item ->> 'kqChung' as kq_chung,
      coalesce(payload.item -> 'calculatedFrom', '{}'::jsonb) as calculated_from,
      payload.item_ordinal
    from jsonb_array_elements(coalesce(p_conclusions, '[]'::jsonb))
      with ordinality as payload(item, item_ordinal)
  ),
  parsed_conclusions as (
    select distinct on (group_id)
      group_id,
      kq_chung,
      calculated_from
    from raw_conclusions
    order by group_id, item_ordinal desc
  )
  insert into public.sample_group_conclusions (
    organization_id,
    sample_id,
    result_group_id,
    kq_chung,
    calculated_from
  )
  select
    p_organization_id,
    p_sample_id,
    parsed_conclusions.group_id,
    parsed_conclusions.kq_chung,
    parsed_conclusions.calculated_from
  from parsed_conclusions
  on conflict (sample_id, result_group_id)
  do update set
    kq_chung = excluded.kq_chung,
    calculated_from = excluded.calculated_from,
    updated_at = now();

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
