-- US-004 follow-up: template writes and assignment replacement audit transaction RPCs.

create or replace function public.create_result_template_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_sample_type_id uuid,
  p_code text,
  p_name text,
  p_is_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_template_id uuid;
begin
  if not exists (
    select 1
    from public.sample_types
    where id = p_sample_type_id
      and organization_id = p_organization_id
  ) then
    raise exception 'sample type does not belong to organization';
  end if;

  insert into public.result_templates (
    organization_id,
    sample_type_id,
    code,
    name,
    is_active
  )
  values (p_organization_id, p_sample_type_id, p_code, p_name, p_is_active)
  returning id into new_template_id;

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_template.created',
    'result_templates',
    new_template_id,
    jsonb_build_object(
      'sampleTypeId', p_sample_type_id,
      'code', p_code,
      'name', p_name,
      'isActive', p_is_active
    )
  );

  return new_template_id;
end;
$$;

create or replace function public.update_result_template_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_template_id uuid,
  p_sample_type_id uuid,
  p_code text,
  p_name text,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_template_id uuid;
begin
  if not exists (
    select 1
    from public.sample_types
    where id = p_sample_type_id
      and organization_id = p_organization_id
  ) then
    raise exception 'sample type does not belong to organization';
  end if;

  update public.result_templates
  set
    sample_type_id = p_sample_type_id,
    code = p_code,
    name = p_name,
    is_active = p_is_active
  where id = p_template_id
    and organization_id = p_organization_id
  returning id into updated_template_id;

  if updated_template_id is null then
    raise exception 'result template does not belong to organization';
  end if;

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_template.updated',
    'result_templates',
    p_template_id,
    jsonb_build_object(
      'sampleTypeId', p_sample_type_id,
      'code', p_code,
      'name', p_name,
      'isActive', p_is_active
    )
  );
end;
$$;

create or replace function public.replace_result_template_metrics_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_result_template_id uuid,
  p_metric_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.replace_result_template_metrics(
    p_organization_id,
    p_result_template_id,
    p_metric_ids
  );

  perform public.insert_result_configuration_audit(
    p_organization_id,
    p_actor_id,
    'result_template_metrics.replaced',
    'result_template_metrics',
    p_result_template_id,
    jsonb_build_object('metricIds', coalesce(p_metric_ids, array[]::uuid[]))
  );
end;
$$;

revoke all on function public.create_result_template_with_audit(
  uuid, uuid, uuid, text, text, boolean
) from public;
revoke all on function public.create_result_template_with_audit(
  uuid, uuid, uuid, text, text, boolean
) from anon;
revoke all on function public.create_result_template_with_audit(
  uuid, uuid, uuid, text, text, boolean
) from authenticated;
grant execute on function public.create_result_template_with_audit(
  uuid, uuid, uuid, text, text, boolean
) to service_role;

revoke all on function public.update_result_template_with_audit(
  uuid, uuid, uuid, uuid, text, text, boolean
) from public;
revoke all on function public.update_result_template_with_audit(
  uuid, uuid, uuid, uuid, text, text, boolean
) from anon;
revoke all on function public.update_result_template_with_audit(
  uuid, uuid, uuid, uuid, text, text, boolean
) from authenticated;
grant execute on function public.update_result_template_with_audit(
  uuid, uuid, uuid, uuid, text, text, boolean
) to service_role;

revoke all on function public.replace_result_template_metrics_with_audit(
  uuid, uuid, uuid, uuid[]
) from public;
revoke all on function public.replace_result_template_metrics_with_audit(
  uuid, uuid, uuid, uuid[]
) from anon;
revoke all on function public.replace_result_template_metrics_with_audit(
  uuid, uuid, uuid, uuid[]
) from authenticated;
grant execute on function public.replace_result_template_metrics_with_audit(
  uuid, uuid, uuid, uuid[]
) to service_role;
