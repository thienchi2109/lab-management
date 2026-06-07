-- US-008 follow-up: wrap sample image metadata writes and audit events in one transaction.

create or replace function public.create_sample_image_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_sample_id uuid,
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
  new_image_id uuid;
begin
  if not exists (
    select 1
    from public.samples
    where id = p_sample_id
      and organization_id = p_organization_id
  ) then
    raise exception 'sample does not belong to organization';
  end if;

  insert into public.sample_images (
    organization_id,
    sample_id,
    storage_bucket,
    storage_path,
    content_type,
    size_bytes,
    created_by
  )
  values (
    p_organization_id,
    p_sample_id,
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
    'sample_image.created',
    'sample_images',
    new_image_id,
    coalesce(p_audit_payload, '{}'::jsonb)
  );

  return new_image_id;
end;
$$;

create or replace function public.delete_sample_image_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_sample_id uuid,
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
  delete from public.sample_images
  where id = p_image_id
    and sample_id = p_sample_id
    and organization_id = p_organization_id
  returning id into deleted_image_id;

  if deleted_image_id is null then
    raise exception 'sample image does not belong to organization';
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
    'sample_image.deleted',
    'sample_images',
    p_image_id,
    coalesce(p_audit_payload, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.create_sample_image_with_audit(
  uuid, uuid, uuid, text, text, text, integer, jsonb
) from public;
revoke all on function public.create_sample_image_with_audit(
  uuid, uuid, uuid, text, text, text, integer, jsonb
) from anon;
revoke all on function public.create_sample_image_with_audit(
  uuid, uuid, uuid, text, text, text, integer, jsonb
) from authenticated;
grant execute on function public.create_sample_image_with_audit(
  uuid, uuid, uuid, text, text, text, integer, jsonb
) to service_role;

revoke all on function public.delete_sample_image_with_audit(
  uuid, uuid, uuid, uuid, jsonb
) from public;
revoke all on function public.delete_sample_image_with_audit(
  uuid, uuid, uuid, uuid, jsonb
) from anon;
revoke all on function public.delete_sample_image_with_audit(
  uuid, uuid, uuid, uuid, jsonb
) from authenticated;
grant execute on function public.delete_sample_image_with_audit(
  uuid, uuid, uuid, uuid, jsonb
) to service_role;
