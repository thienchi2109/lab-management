-- FB-20260623-02E: make preset RPC validation fail closed for SQL NULLs.

create or replace function public.upsert_report_filter_preset_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_scope text,
  p_config jsonb,
  p_audit_event_payload jsonb
)
returns table (
  config jsonb,
  updated_at timestamptz,
  updated_by uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_scope is distinct from 'analytics-report-default' then
    raise exception 'invalid report filter preset scope';
  end if;

  if p_config is null or jsonb_typeof(p_config) <> 'object' then
    raise exception 'invalid report filter preset config';
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    where tm.organization_id = p_organization_id
      and tm.user_id = p_actor_id
      and tm.role = 'admin'::public.app_role
      and tm.is_active
  ) then
    raise exception 'report filter preset actor is not authorized';
  end if;

  insert into public.report_filter_presets (
    organization_id,
    scope,
    config,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_scope,
    p_config,
    p_actor_id,
    p_actor_id
  )
  on conflict (organization_id, scope)
  do update set
    config = excluded.config,
    updated_by = excluded.updated_by
  returning
    report_filter_presets.config,
    report_filter_presets.updated_at,
    report_filter_presets.updated_by
  into config, updated_at, updated_by;

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
    'report_filter_preset.upserted',
    'report_filter_presets',
    null,
    coalesce(p_audit_event_payload, '{}'::jsonb)
  );

  return next;
end;
$$;

revoke all on function public.upsert_report_filter_preset_with_audit(
  uuid, uuid, text, jsonb, jsonb
) from public;
revoke all on function public.upsert_report_filter_preset_with_audit(
  uuid, uuid, text, jsonb, jsonb
) from authenticated;
grant execute on function public.upsert_report_filter_preset_with_audit(
  uuid, uuid, text, jsonb, jsonb
) to service_role;
