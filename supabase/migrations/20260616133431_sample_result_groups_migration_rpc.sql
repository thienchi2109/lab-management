-- FB-20260615-04D: persist selected result groups per sample and enforce them in RPCs.

create unique index if not exists samples_id_organization_id_key
  on public.samples (id, organization_id);
create unique index if not exists result_groups_id_organization_id_key
  on public.result_groups (id, organization_id);

create table public.sample_result_groups (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null,
  result_group_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (sample_id, result_group_id),
  foreign key (sample_id, organization_id) references public.samples(id, organization_id) on delete cascade,
  foreign key (result_group_id, organization_id) references public.result_groups(id, organization_id) on delete restrict
);

create index sample_result_groups_org_sample_idx
  on public.sample_result_groups (organization_id, sample_id);
create index sample_result_groups_org_group_idx
  on public.sample_result_groups (organization_id, result_group_id);

alter table public.sample_result_groups enable row level security;

create policy "members can view sample result groups"
  on public.sample_result_groups for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));
create policy "editors can insert sample result groups"
  on public.sample_result_groups for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can update sample result groups"
  on public.sample_result_groups for update
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can delete sample result groups"
  on public.sample_result_groups for delete
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

with selected_templates as (
  select distinct on (s.id)
    s.id as sample_id,
    rt.id as template_id
  from public.samples s
  join public.result_templates rt
    on rt.organization_id = s.organization_id
   and rt.sample_type_id = s.sample_type_id
   and rt.is_active = true
  order by s.id, rt.created_at desc, rt.id desc
),
template_groups as (
  select distinct
    s.organization_id,
    s.id as sample_id,
    rm.result_group_id
  from public.samples s
  join selected_templates st on st.sample_id = s.id
  join public.result_template_metrics rtm
    on rtm.organization_id = s.organization_id
   and rtm.result_template_id = st.template_id
  join public.result_metrics rm
    on rm.id = rtm.result_metric_id
   and rm.organization_id = s.organization_id
   and rm.is_active = true
),
fallback_groups as (
  select s.organization_id, s.id as sample_id, rg.id as result_group_id
  from public.samples s
  join public.result_groups rg
    on rg.organization_id = s.organization_id
   and rg.is_active = true
  where not exists (
    select 1 from template_groups tg where tg.sample_id = s.id
  )
)
insert into public.sample_result_groups (organization_id, sample_id, result_group_id)
select organization_id, sample_id, result_group_id from template_groups
union
select organization_id, sample_id, result_group_id from fallback_groups
on conflict do nothing;

drop function if exists public.create_sample_metadata_with_code(
  uuid, uuid, uuid, uuid, uuid, uuid, text, date, date,
  public.sample_status, public.sample_billing_status, text, jsonb
);

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
  p_audit_event_payload jsonb,
  p_result_group_ids uuid[]
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
  if not coalesce(cardinality(p_result_group_ids) > 0, false) then
    raise exception 'at least one result group is required';
  end if;
  if not exists (
    select 1 from public.sample_types
    where id = p_sample_type_id and organization_id = p_organization_id and is_active = true
  ) then
    raise exception 'sample type does not belong to organization';
  end if;
  if p_customer_id is not null and not exists (
    select 1 from public.customers
    where id = p_customer_id and organization_id = p_organization_id and is_active = true
  ) then
    raise exception 'customer does not belong to organization';
  end if;
  if p_company_id is not null and not exists (
    select 1 from public.companies
    where id = p_company_id and organization_id = p_organization_id and is_active = true
  ) then
    raise exception 'company does not belong to organization';
  end if;
  if p_kit_batch_id is not null and not exists (
    select 1 from public.kit_batches
    where id = p_kit_batch_id and organization_id = p_organization_id
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

  date_segment := to_char(timezone('Asia/Ho_Chi_Minh', now()), 'YYMMDD');

  for attempt in 1..5 loop
    entropy := '';
    random_bytes := extensions.gen_random_bytes(7);
    for byte_index in 0..6 loop
      entropy := entropy || substr(alphabet, (get_byte(random_bytes, byte_index) % 32) + 1, 1);
    end loop;
    code_body := 'HP-' || date_segment || '-' || entropy;
    check_index := (((hashtextextended(code_body, 0) % 32) + 32) % 32)::integer + 1;
    generated_sample_code := code_body || substr(alphabet, check_index, 1);

    begin
      insert into public.samples (
        organization_id, sample_type_id, customer_id, company_id, kit_batch_id,
        sample_code, customer_name, collected_at, received_at, status,
        billing_status, metadata, created_by
      )
      values (
        p_organization_id, p_sample_type_id, p_customer_id, p_company_id, p_kit_batch_id,
        generated_sample_code, p_customer_name, p_collected_at, p_received_at, p_status,
        p_billing_status, jsonb_build_object('note', p_note), p_actor_id
      )
      returning id into new_sample_id;

      insert into public.sample_result_groups (organization_id, sample_id, result_group_id)
      select p_organization_id, new_sample_id, selected.id
      from (select distinct unnest(p_result_group_ids) as id) selected;

      insert into public.audit_events (
        organization_id, actor_id, action, entity_table, entity_id, event_payload
      )
      values (
        p_organization_id, p_actor_id, 'sample.created', 'samples', new_sample_id,
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
  uuid, uuid, uuid, uuid, uuid, uuid, text, date, date, public.sample_status, public.sample_billing_status, text, jsonb, uuid[]
) from public;
revoke all on function public.create_sample_metadata_with_code(
  uuid, uuid, uuid, uuid, uuid, uuid, text, date, date, public.sample_status, public.sample_billing_status, text, jsonb, uuid[]
) from anon;
revoke all on function public.create_sample_metadata_with_code(
  uuid, uuid, uuid, uuid, uuid, uuid, text, date, date, public.sample_status, public.sample_billing_status, text, jsonb, uuid[]
) from authenticated;
grant execute on function public.create_sample_metadata_with_code(
  uuid, uuid, uuid, uuid, uuid, uuid, text, date, date, public.sample_status, public.sample_billing_status, text, jsonb, uuid[]
) to service_role;

create or replace function public.save_sample_results_with_audit(
  p_organization_id uuid, p_actor_id uuid, p_sample_id uuid,
  p_results jsonb, p_conclusions jsonb, p_audit_event jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_sample_id uuid;
begin
  if p_organization_id is null or p_actor_id is null or p_sample_id is null then
    raise exception 'organization_id, actor_id, and sample_id are required';
  end if;

  select id into locked_sample_id
  from public.samples
  where id = p_sample_id and organization_id = p_organization_id
  for share;
  if locked_sample_id is null then
    raise exception 'sample does not belong to organization';
  end if;

  if exists (
    with raw_results as (
      select (payload.item ->> 'metricId')::uuid as metric_id
      from jsonb_array_elements(coalesce(p_results, '[]'::jsonb)) with ordinality as payload(item, item_ordinal)
    ),
    valid_sample_groups as (
      select srg.result_group_id
      from public.sample_result_groups srg
      where srg.organization_id = p_organization_id and srg.sample_id = p_sample_id
      for share of srg
    ),
    valid_sample_metrics as (
      select rm.id
      from public.result_metrics rm
      join valid_sample_groups vsg on vsg.result_group_id = rm.result_group_id
      where rm.organization_id = p_organization_id and rm.is_active = true
    )
    select 1 from raw_results rr
    left join valid_sample_metrics vsm on vsm.id = rr.metric_id
    where vsm.id is null
  ) then
    raise exception 'result metric does not belong to selected sample result groups';
  end if;

  with raw_results as (
    select (payload.item ->> 'metricId')::uuid as metric_id, payload.item -> 'value' as value, payload.item_ordinal
    from jsonb_array_elements(coalesce(p_results, '[]'::jsonb)) with ordinality as payload(item, item_ordinal)
  ),
  parsed_results as (
    select distinct on (metric_id) metric_id, value
    from raw_results
    order by metric_id, item_ordinal desc
  )
  insert into public.sample_results (organization_id, sample_id, result_metric_id, value, entered_by)
  select p_organization_id, p_sample_id, parsed_results.metric_id, parsed_results.value, p_actor_id
  from parsed_results
  on conflict (sample_id, result_metric_id)
  do update set value = excluded.value, entered_by = excluded.entered_by, updated_at = now();

  if exists (
    with raw_conclusions as (
      select (payload.item ->> 'groupId')::uuid as group_id
      from jsonb_array_elements(coalesce(p_conclusions, '[]'::jsonb)) with ordinality as payload(item, item_ordinal)
    ),
    valid_sample_groups as (
      select srg.result_group_id
      from public.sample_result_groups srg
      where srg.organization_id = p_organization_id and srg.sample_id = p_sample_id
      for share of srg
    )
    select 1 from raw_conclusions rc
    left join valid_sample_groups vsg on vsg.result_group_id = rc.group_id
    where vsg.result_group_id is null
  ) then
    raise exception 'result group does not belong to selected sample result groups';
  end if;

  with raw_conclusions as (
    select
      (payload.item ->> 'groupId')::uuid as group_id,
      payload.item ->> 'kqChung' as kq_chung,
      coalesce(payload.item -> 'calculatedFrom', '{}'::jsonb) as calculated_from,
      payload.item_ordinal
    from jsonb_array_elements(coalesce(p_conclusions, '[]'::jsonb)) with ordinality as payload(item, item_ordinal)
  ),
  parsed_conclusions as (
    select distinct on (group_id) group_id, kq_chung, calculated_from
    from raw_conclusions
    order by group_id, item_ordinal desc
  )
  insert into public.sample_group_conclusions (organization_id, sample_id, result_group_id, kq_chung, calculated_from)
  select p_organization_id, p_sample_id, parsed_conclusions.group_id, parsed_conclusions.kq_chung, parsed_conclusions.calculated_from
  from parsed_conclusions
  on conflict (sample_id, result_group_id)
  do update set kq_chung = excluded.kq_chung, calculated_from = excluded.calculated_from, updated_at = now();

  insert into public.audit_events (organization_id, actor_id, action, entity_table, entity_id, event_payload)
  values (
    p_organization_id, p_actor_id,
    coalesce(p_audit_event ->> 'action', 'sample_results.updated'),
    coalesce(p_audit_event ->> 'entityTable', 'sample_results'),
    p_sample_id,
    coalesce(p_audit_event -> 'eventPayload', '{}'::jsonb)
  );
end;
$$;

revoke all on function public.save_sample_results_with_audit(uuid, uuid, uuid, jsonb, jsonb, jsonb) from public;
revoke all on function public.save_sample_results_with_audit(uuid, uuid, uuid, jsonb, jsonb, jsonb) from anon;
revoke all on function public.save_sample_results_with_audit(uuid, uuid, uuid, jsonb, jsonb, jsonb) from authenticated;
grant execute on function public.save_sample_results_with_audit(uuid, uuid, uuid, jsonb, jsonb, jsonb) to service_role;
