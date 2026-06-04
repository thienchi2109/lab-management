-- Demo seed for US-002. Safe to re-run for reference/configuration data.

with org as (
  insert into public.organizations (name, slug)
  values ('Demo Lab', 'demo-lab')
  on conflict (slug) do update set name = excluded.name
  returning id
),
sample_type as (
  insert into public.sample_types (organization_id, code, name, description)
  select id, 'SWINE_ORAL_FLUID', 'Swine Oral Fluid', 'Mau dich mieng heo cho showcase' from org
  on conflict (organization_id, code) do update set name = excluded.name
  returning id, organization_id
),
kit_type as (
  insert into public.kit_types (organization_id, code, name, manufacturer)
  select id, 'PCR_KIT_DEMO', 'PCR Demo Kit', 'Demo Manufacturer' from org
  on conflict (organization_id, code) do update set name = excluded.name
  returning id, organization_id
),
kit_batch as (
  insert into public.kit_batches (
    organization_id,
    kit_type_id,
    lot_number,
    received_quantity,
    remaining_quantity,
    expires_on
  )
  select organization_id, id, 'LOT-DEMO-001', 100, 100, current_date + interval '12 months' from kit_type
  on conflict (organization_id, kit_type_id, lot_number) do update
    set remaining_quantity = excluded.remaining_quantity
  returning id, organization_id
),
group_pcr as (
  insert into public.result_groups (organization_id, code, name, sort_order)
  select id, 'PCR', 'PCR', 10 from org
  on conflict (organization_id, code) do update set name = excluded.name
  returning id, organization_id
),
metric_ct as (
  insert into public.result_metrics (
    organization_id,
    result_group_id,
    code,
    name,
    input_type,
    unit,
    metric_settings,
    sort_order,
    is_required
  )
  select
    organization_id,
    id,
    'PCR_REALTIME',
    'PCR Realtime Ct',
    'pcr_realtime',
    'Ct',
    '{"positive_threshold": 35, "negative_label": "Khong phat hien"}'::jsonb,
    10,
    true
  from group_pcr
  on conflict (organization_id, result_group_id, code) do update
    set metric_settings = excluded.metric_settings
  returning id, organization_id
),
metric_conclusion as (
  insert into public.result_metrics (
    organization_id,
    result_group_id,
    code,
    name,
    input_type,
    options,
    sort_order,
    is_required
  )
  select
    organization_id,
    id,
    'KQ_CHUNG',
    'Ket qua chung',
    'select',
    '["Duong tinh", "Am tinh", "Nghi ngo"]'::jsonb,
    20,
    true
  from group_pcr
  on conflict (organization_id, result_group_id, code) do update
    set options = excluded.options
  returning id, organization_id
),
template as (
  insert into public.result_templates (organization_id, sample_type_id, code, name)
  select organization_id, id, 'PCR_BASIC', 'PCR Basic Template' from sample_type
  on conflict (organization_id, code) do update set name = excluded.name
  returning id, organization_id
)
insert into public.result_template_metrics (
  organization_id,
  result_template_id,
  result_metric_id,
  sort_order
)
select template.organization_id, template.id, metric_ct.id, 10 from template, metric_ct
union all
select template.organization_id, template.id, metric_conclusion.id, 20 from template, metric_conclusion
on conflict (result_template_id, result_metric_id) do nothing;
