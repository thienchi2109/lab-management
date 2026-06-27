-- FB-20260623-02F: organization-scoped report image gallery.

create table public.report_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  content_type text not null,
  size_bytes integer not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint report_images_content_type_check
    check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint report_images_size_bytes_check
    check (size_bytes > 0 and size_bytes <= 5242880),
  constraint report_images_storage_path_check
    check (length(btrim(storage_path)) > 0),
  constraint report_images_provider_unique
    unique (organization_id, storage_bucket, storage_path)
);

create index report_images_organization_created_at_idx
  on public.report_images (organization_id, created_at desc);

create index report_images_created_by_idx
  on public.report_images (created_by);

alter table public.report_images enable row level security;

create policy "members can view report images"
  on public.report_images for select
  to authenticated
  using (
    private.has_org_role(
      organization_id,
      array['admin', 'editor', 'viewer']::public.app_role[]
    )
  );

create policy "admins can insert report images"
  on public.report_images for insert
  to authenticated
  with check (
    private.has_org_role(organization_id, array['admin']::public.app_role[])
  );

create policy "admins can delete report images"
  on public.report_images for delete
  to authenticated
  using (
    private.has_org_role(organization_id, array['admin']::public.app_role[])
  );

create or replace function public.create_report_image_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_storage_bucket text,
  p_storage_path text,
  p_content_type text,
  p_size_bytes integer,
  p_audit_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_image_count integer;
  new_image_id uuid;
begin
  if p_organization_id is null
    or p_actor_id is null
    or nullif(btrim(p_storage_bucket), '') is null
    or nullif(btrim(p_storage_path), '') is null
    or p_content_type is null
    or p_size_bytes is null
  then
    raise exception 'invalid report image input';
  end if;

  if p_content_type not in ('image/jpeg', 'image/png', 'image/webp') then
    raise exception 'unsupported report image content type';
  end if;

  if p_size_bytes <= 0 or p_size_bytes > 5242880 then
    raise exception 'invalid report image size';
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    where tm.organization_id = p_organization_id
      and tm.user_id = p_actor_id
      and tm.role = 'admin'::public.app_role
      and tm.is_active
  ) then
    raise exception 'report image actor is not authorized';
  end if;

  perform 1
  from public.organizations
  where id = p_organization_id
  for update;

  if not found then
    raise exception 'organization does not exist';
  end if;

  select count(*)
  into current_image_count
  from public.report_images
  where organization_id = p_organization_id;

  if current_image_count >= 20 then
    raise exception 'report image limit reached';
  end if;

  insert into public.report_images (
    organization_id,
    storage_bucket,
    storage_path,
    content_type,
    size_bytes,
    created_by
  )
  values (
    p_organization_id,
    p_storage_bucket,
    p_storage_path,
    p_content_type,
    p_size_bytes,
    p_actor_id
  )
  returning id into new_image_id;

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
    'report_image.created',
    'report_images',
    new_image_id,
    coalesce(p_audit_payload, '{}'::jsonb)
  );

  return new_image_id;
end;
$$;

create or replace function public.delete_report_image_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_image_id uuid,
  p_audit_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_image_id uuid;
begin
  if p_organization_id is null or p_actor_id is null or p_image_id is null then
    raise exception 'invalid report image delete input';
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    where tm.organization_id = p_organization_id
      and tm.user_id = p_actor_id
      and tm.role = 'admin'::public.app_role
      and tm.is_active
  ) then
    raise exception 'report image actor is not authorized';
  end if;

  delete from public.report_images
  where id = p_image_id
    and organization_id = p_organization_id
  returning id into deleted_image_id;

  if deleted_image_id is null then
    raise exception 'report image does not belong to organization';
  end if;

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
    'report_image.deleted',
    'report_images',
    p_image_id,
    coalesce(p_audit_payload, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.create_report_image_with_audit(
  uuid, uuid, text, text, text, integer, jsonb
) from public;
revoke all on function public.create_report_image_with_audit(
  uuid, uuid, text, text, text, integer, jsonb
) from anon;
revoke all on function public.create_report_image_with_audit(
  uuid, uuid, text, text, text, integer, jsonb
) from authenticated;
grant execute on function public.create_report_image_with_audit(
  uuid, uuid, text, text, text, integer, jsonb
) to service_role;

revoke all on function public.delete_report_image_with_audit(
  uuid, uuid, uuid, jsonb
) from public;
revoke all on function public.delete_report_image_with_audit(
  uuid, uuid, uuid, jsonb
) from anon;
revoke all on function public.delete_report_image_with_audit(
  uuid, uuid, uuid, jsonb
) from authenticated;
grant execute on function public.delete_report_image_with_audit(
  uuid, uuid, uuid, jsonb
) to service_role;
