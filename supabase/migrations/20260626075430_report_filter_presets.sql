-- FB-20260623-02E: organization-scoped default report filter presets.

create table public.report_filter_presets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope text not null,
  config jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_filter_presets_scope_check
    check (scope = 'analytics-report-default'),
  constraint report_filter_presets_config_object_check
    check (jsonb_typeof(config) = 'object'),
  constraint report_filter_presets_org_scope_key
    unique (organization_id, scope)
);

create index report_filter_presets_org_updated_idx
  on public.report_filter_presets (organization_id, updated_at desc);

alter table public.report_filter_presets enable row level security;

create policy "members can view report filter presets"
  on public.report_filter_presets for select
  to authenticated
  using (
    private.has_org_role(
      organization_id,
      array['admin','editor','viewer']::public.app_role[]
    )
  );

create policy "admins can insert report filter presets"
  on public.report_filter_presets for insert
  to authenticated
  with check (
    private.has_org_role(organization_id, array['admin']::public.app_role[])
  );

create policy "admins can update report filter presets"
  on public.report_filter_presets for update
  to authenticated
  using (
    private.has_org_role(organization_id, array['admin']::public.app_role[])
  )
  with check (
    private.has_org_role(organization_id, array['admin']::public.app_role[])
  );

create trigger set_report_filter_presets_updated_at
  before update on public.report_filter_presets
  for each row
  execute function private.set_updated_at();

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
  if p_scope <> 'analytics-report-default' then
    raise exception 'invalid report filter preset scope';
  end if;

  if jsonb_typeof(p_config) <> 'object' then
    raise exception 'invalid report filter preset config';
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
) from anon;
revoke all on function public.upsert_report_filter_preset_with_audit(
  uuid, uuid, text, jsonb, jsonb
) from authenticated;
grant execute on function public.upsert_report_filter_preset_with_audit(
  uuid, uuid, text, jsonb, jsonb
) to service_role;
