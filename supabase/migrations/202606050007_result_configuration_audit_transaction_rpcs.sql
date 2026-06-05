-- US-004 follow-up: wrap result-configuration writes and audit events in one transaction.

create or replace function public.insert_result_configuration_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_action text,
  p_entity_table text,
  p_entity_id uuid,
  p_event_payload jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
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
    p_action,
    p_entity_table,
    p_entity_id,
    p_event_payload
  );
$$;

create or replace function public.create_result_group_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_code text,
  p_name text,
  p_sort_order integer,
  p_is_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_group_id uuid;
begin
  insert into public.result_groups (
    organization_id,
    code,
    name,
    sort_order,
    is_active
  )
  values (p_organization_id, p_code, p_name, p_sort_order, p_is_active)
  returning id into new_group_id;

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_group.created',
    'result_groups',
    new_group_id,
    jsonb_build_object(
      'code', p_code,
      'name', p_name,
      'sortOrder', p_sort_order,
      'isActive', p_is_active
    )
  );

  return new_group_id;
end;
$$;

create or replace function public.update_result_group_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_group_id uuid,
  p_code text,
  p_name text,
  p_sort_order integer,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_group_id uuid;
begin
  update public.result_groups
  set
    code = p_code,
    name = p_name,
    sort_order = p_sort_order,
    is_active = p_is_active
  where id = p_group_id
    and organization_id = p_organization_id
  returning id into updated_group_id;

  if updated_group_id is null then
    raise exception 'result group does not belong to organization';
  end if;

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_group.updated',
    'result_groups',
    p_group_id,
    jsonb_build_object(
      'code', p_code,
      'name', p_name,
      'sortOrder', p_sort_order,
      'isActive', p_is_active
    )
  );
end;
$$;

create or replace function public.create_result_metric_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_result_group_id uuid,
  p_code text,
  p_name text,
  p_input_type public.result_input_type,
  p_unit text,
  p_options jsonb,
  p_metric_settings jsonb,
  p_sort_order integer,
  p_is_required boolean,
  p_is_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_metric_id uuid;
begin
  if not exists (
    select 1
    from public.result_groups
    where id = p_result_group_id
      and organization_id = p_organization_id
  ) then
    raise exception 'result group does not belong to organization';
  end if;

  insert into public.result_metrics (
    organization_id,
    result_group_id,
    code,
    name,
    input_type,
    unit,
    options,
    metric_settings,
    sort_order,
    is_required,
    is_active
  )
  values (
    p_organization_id,
    p_result_group_id,
    p_code,
    p_name,
    p_input_type,
    p_unit,
    coalesce(p_options, '[]'::jsonb),
    coalesce(p_metric_settings, '{}'::jsonb),
    p_sort_order,
    p_is_required,
    p_is_active
  )
  returning id into new_metric_id;

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_metric.created',
    'result_metrics',
    new_metric_id,
    jsonb_build_object(
      'resultGroupId', p_result_group_id,
      'code', p_code,
      'name', p_name,
      'inputType', p_input_type,
      'unit', p_unit,
      'options', coalesce(p_options, '[]'::jsonb),
      'metricSettings', coalesce(p_metric_settings, '{}'::jsonb),
      'sortOrder', p_sort_order,
      'isRequired', p_is_required,
      'isActive', p_is_active
    )
  );

  return new_metric_id;
end;
$$;

create or replace function public.update_result_metric_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_metric_id uuid,
  p_result_group_id uuid,
  p_code text,
  p_name text,
  p_input_type public.result_input_type,
  p_unit text,
  p_options jsonb,
  p_metric_settings jsonb,
  p_sort_order integer,
  p_is_required boolean,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_metric_id uuid;
begin
  if not exists (
    select 1
    from public.result_groups
    where id = p_result_group_id
      and organization_id = p_organization_id
  ) then
    raise exception 'result group does not belong to organization';
  end if;

  update public.result_metrics
  set
    result_group_id = p_result_group_id,
    code = p_code,
    name = p_name,
    input_type = p_input_type,
    unit = p_unit,
    options = coalesce(p_options, '[]'::jsonb),
    metric_settings = coalesce(p_metric_settings, '{}'::jsonb),
    sort_order = p_sort_order,
    is_required = p_is_required,
    is_active = p_is_active
  where id = p_metric_id
    and organization_id = p_organization_id
  returning id into updated_metric_id;

  if updated_metric_id is null then
    raise exception 'result metric does not belong to organization';
  end if;

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_metric.updated',
    'result_metrics',
    p_metric_id,
    jsonb_build_object(
      'resultGroupId', p_result_group_id,
      'code', p_code,
      'name', p_name,
      'inputType', p_input_type,
      'unit', p_unit,
      'options', coalesce(p_options, '[]'::jsonb),
      'metricSettings', coalesce(p_metric_settings, '{}'::jsonb),
      'sortOrder', p_sort_order,
      'isRequired', p_is_required,
      'isActive', p_is_active
    )
  );
end;
$$;

revoke all on function public.insert_result_configuration_audit(
  uuid, uuid, text, text, uuid, jsonb
) from public;
revoke all on function public.insert_result_configuration_audit(
  uuid, uuid, text, text, uuid, jsonb
) from anon;
revoke all on function public.insert_result_configuration_audit(
  uuid, uuid, text, text, uuid, jsonb
) from authenticated;
grant execute on function public.insert_result_configuration_audit(
  uuid, uuid, text, text, uuid, jsonb
) to service_role;

revoke all on function public.create_result_group_with_audit(
  uuid, uuid, text, text, integer, boolean
) from public;
revoke all on function public.create_result_group_with_audit(
  uuid, uuid, text, text, integer, boolean
) from anon;
revoke all on function public.create_result_group_with_audit(
  uuid, uuid, text, text, integer, boolean
) from authenticated;
grant execute on function public.create_result_group_with_audit(
  uuid, uuid, text, text, integer, boolean
) to service_role;

revoke all on function public.update_result_group_with_audit(
  uuid, uuid, uuid, text, text, integer, boolean
) from public;
revoke all on function public.update_result_group_with_audit(
  uuid, uuid, uuid, text, text, integer, boolean
) from anon;
revoke all on function public.update_result_group_with_audit(
  uuid, uuid, uuid, text, text, integer, boolean
) from authenticated;
grant execute on function public.update_result_group_with_audit(
  uuid, uuid, uuid, text, text, integer, boolean
) to service_role;

revoke all on function public.create_result_metric_with_audit(
  uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) from public;
revoke all on function public.create_result_metric_with_audit(
  uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) from anon;
revoke all on function public.create_result_metric_with_audit(
  uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) from authenticated;
grant execute on function public.create_result_metric_with_audit(
  uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) to service_role;

revoke all on function public.update_result_metric_with_audit(
  uuid, uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) from public;
revoke all on function public.update_result_metric_with_audit(
  uuid, uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) from anon;
revoke all on function public.update_result_metric_with_audit(
  uuid, uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) from authenticated;
grant execute on function public.update_result_metric_with_audit(
  uuid, uuid, uuid, uuid, text, text, public.result_input_type, text, jsonb, jsonb, integer, boolean, boolean
) to service_role;
