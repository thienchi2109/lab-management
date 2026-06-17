-- FB-20260615-04E review follow-up: preserve existing sample metadata keys when updating note.

create or replace function public.update_sample_metadata_with_result_groups(
  p_organization_id uuid,
  p_actor_id uuid,
  p_sample_id uuid,
  p_sample_type_id uuid,
  p_customer_id uuid,
  p_company_id uuid,
  p_kit_batch_id uuid,
  p_customer_name text,
  p_collected_at date,
  p_received_at date,
  p_status public.sample_status,
  p_billing_status public.sample_billing_status,
  p_note text,
  p_result_group_ids uuid[],
  p_audit_event_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_sample_id uuid;
begin
  if p_organization_id is null
    or p_actor_id is null
    or p_sample_id is null
    or p_sample_type_id is null then
    raise exception 'organization_id, actor_id, sample_id, and sample_type_id are required';
  end if;

  if not coalesce(cardinality(p_result_group_ids) > 0, false) then
    raise exception 'at least one result group is required';
  end if;

  if exists (
    select 1
    from unnest(p_result_group_ids) as selected(id)
    where selected.id is null
  ) then
    raise exception 'result_group_ids cannot contain null values';
  end if;

  if not exists (
    select 1
    from public.sample_types
    where id = p_sample_type_id
      and organization_id = p_organization_id
      and is_active = true
  ) then
    raise exception 'sample type does not belong to organization';
  end if;

  if p_customer_id is not null and not exists (
    select 1
    from public.customers
    where id = p_customer_id
      and organization_id = p_organization_id
      and is_active = true
  ) then
    raise exception 'customer does not belong to organization';
  end if;

  if p_company_id is not null and not exists (
    select 1
    from public.companies
    where id = p_company_id
      and organization_id = p_organization_id
      and is_active = true
  ) then
    raise exception 'company does not belong to organization';
  end if;

  if p_kit_batch_id is not null and not exists (
    select 1
    from public.kit_batches
    where id = p_kit_batch_id
      and organization_id = p_organization_id
  ) then
    raise exception 'kit batch does not belong to organization';
  end if;

  if exists (
    with selected as (select distinct unnest(p_result_group_ids) as id)
    select 1
    from selected
    left join public.result_groups rg
      on rg.id = selected.id
     and rg.organization_id = p_organization_id
     and rg.is_active = true
    where rg.id is null
  ) then
    raise exception 'result group does not belong to organization';
  end if;

  update public.samples
  set
    sample_type_id = p_sample_type_id,
    customer_id = p_customer_id,
    company_id = p_company_id,
    kit_batch_id = p_kit_batch_id,
    customer_name = p_customer_name,
    collected_at = p_collected_at,
    received_at = p_received_at,
    status = p_status,
    billing_status = p_billing_status,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('note', p_note),
    updated_at = now()
  where id = p_sample_id
    and organization_id = p_organization_id
  returning id into updated_sample_id;

  if updated_sample_id is null then
    raise exception 'sample does not belong to organization';
  end if;

  delete from public.sample_result_groups
  where sample_id = p_sample_id
    and organization_id = p_organization_id
    and not (result_group_id = any(p_result_group_ids));

  insert into public.sample_result_groups (
    organization_id,
    sample_id,
    result_group_id
  )
  select
    p_organization_id,
    p_sample_id,
    selected.result_group_id
  from (
    select distinct unnest(p_result_group_ids) as result_group_id
  ) selected
  on conflict (sample_id, result_group_id) do nothing;

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
    'sample.updated',
    'samples',
    p_sample_id,
    coalesce(p_audit_event_payload, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.update_sample_metadata_with_result_groups(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  date,
  date,
  public.sample_status,
  public.sample_billing_status,
  text,
  uuid[],
  jsonb
) from public;
revoke all on function public.update_sample_metadata_with_result_groups(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  date,
  date,
  public.sample_status,
  public.sample_billing_status,
  text,
  uuid[],
  jsonb
) from anon;
revoke all on function public.update_sample_metadata_with_result_groups(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  date,
  date,
  public.sample_status,
  public.sample_billing_status,
  text,
  uuid[],
  jsonb
) from authenticated;
grant execute on function public.update_sample_metadata_with_result_groups(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  date,
  date,
  public.sample_status,
  public.sample_billing_status,
  text,
  uuid[],
  jsonb
) to service_role;
