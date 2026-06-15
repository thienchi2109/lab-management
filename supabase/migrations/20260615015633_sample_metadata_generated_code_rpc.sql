-- BACKLOG-6B: generate HP sample codes inside the sample create transaction.

create or replace function public.create_sample_metadata_with_code(
  p_organization_id uuid,
  p_actor_id uuid,
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
  p_audit_event_payload jsonb
)
returns table(sample_id uuid, sample_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  attempt integer;
  byte_index integer;
  check_index integer;
  code_body text;
  date_segment text;
  entropy text;
  generated_sample_code text;
  new_sample_id uuid;
  random_bytes bytea;
begin
  if p_organization_id is null or p_actor_id is null or p_sample_type_id is null then
    raise exception 'organization_id, actor_id, and sample_type_id are required';
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

  date_segment := to_char(timezone('Asia/Ho_Chi_Minh', now()), 'YYMMDD');

  for attempt in 1..5 loop
    entropy := '';
    random_bytes := gen_random_bytes(7);

    for byte_index in 0..6 loop
      entropy := entropy || substr(
        alphabet,
        (get_byte(random_bytes, byte_index) % 32) + 1,
        1
      );
    end loop;

    code_body := 'HP-' || date_segment || '-' || entropy;
    check_index := (((hashtextextended(code_body, 0) % 32) + 32) % 32)::integer + 1;
    generated_sample_code := code_body || substr(alphabet, check_index, 1);

    begin
      insert into public.samples (
        organization_id,
        sample_type_id,
        customer_id,
        company_id,
        kit_batch_id,
        sample_code,
        customer_name,
        collected_at,
        received_at,
        status,
        billing_status,
        metadata,
        created_by
      )
      values (
        p_organization_id,
        p_sample_type_id,
        p_customer_id,
        p_company_id,
        p_kit_batch_id,
        generated_sample_code,
        p_customer_name,
        p_collected_at,
        p_received_at,
        p_status,
        p_billing_status,
        jsonb_build_object('note', p_note),
        p_actor_id
      )
      returning id into new_sample_id;

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
        'sample.created',
        'samples',
        new_sample_id,
        coalesce(p_audit_event_payload, '{}'::jsonb)
          || jsonb_build_object('sampleCode', generated_sample_code)
      );

      sample_id := new_sample_id;
      sample_code := generated_sample_code;
      return next;
      return;
    exception
      when unique_violation then
        if attempt = 5 then
          raise exception 'could not generate unique sample code';
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.create_sample_metadata_with_code(
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
  jsonb
) from public;
revoke all on function public.create_sample_metadata_with_code(
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
  jsonb
) from anon;
revoke all on function public.create_sample_metadata_with_code(
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
  jsonb
) from authenticated;
grant execute on function public.create_sample_metadata_with_code(
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
  jsonb
) to service_role;
