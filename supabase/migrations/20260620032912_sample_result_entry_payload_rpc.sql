-- PERF-20260619-03: read sample result entry payload through one tenant-scoped RPC.

create or replace function public.get_sample_result_entry_payload(
  p_organization_id uuid,
  p_sample_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with sample_row as (
    select
      s.id,
      s.organization_id,
      s.sample_type_id,
      s.sample_code,
      s.customer_name,
      s.received_at,
      s.status,
      st.name as sample_type_name,
      c.name as company_name
    from public.samples s
    join public.sample_types st
      on st.id = s.sample_type_id
     and st.organization_id = s.organization_id
    left join public.companies c
      on c.id = s.company_id
     and c.organization_id = s.organization_id
    where s.id = p_sample_id
      and s.organization_id = p_organization_id
  ),
  selected_template as (
    select rt.id, rt.name
    from sample_row s
    join public.result_templates rt
      on rt.organization_id = s.organization_id
     and rt.sample_type_id = s.sample_type_id
     and rt.is_active = true
    order by rt.created_at desc, rt.id desc
    limit 1
  ),
  selected_groups as (
    select srg.result_group_id
    from public.sample_result_groups srg
    where srg.organization_id = p_organization_id
      and srg.sample_id = p_sample_id
  ),
  selected_group_state as (
    select exists(select 1 from selected_groups) as has_selected_groups
  ),
  template_assignments as (
    select rtm.result_metric_id, rtm.sort_order
    from selected_template st
    join public.result_template_metrics rtm
      on rtm.organization_id = p_organization_id
     and rtm.result_template_id = st.id
  ),
  metric_rows as (
    select
      rm.id,
      rm.result_group_id,
      rm.code,
      rm.name,
      rm.input_type::text as input_type,
      rm.unit,
      rm.options,
      rm.metric_settings,
      coalesce(ta.sort_order, rm.sort_order) as metric_sort_order,
      rm.is_required
    from public.result_metrics rm
    cross join selected_group_state sgs
    left join template_assignments ta on ta.result_metric_id = rm.id
    where rm.organization_id = p_organization_id
      and rm.is_active = true
      and (
        (
          sgs.has_selected_groups
          and exists (
            select 1
            from selected_groups sg
            where sg.result_group_id = rm.result_group_id
          )
        )
        or (
          not sgs.has_selected_groups
          and ta.result_metric_id is not null
        )
      )
  ),
  metrics_by_group as (
    select
      mr.result_group_id,
      jsonb_agg(
        jsonb_build_object(
          'id', mr.id,
          'code', mr.code,
          'name', mr.name,
          'inputType', mr.input_type,
          'unit', mr.unit,
          'options', mr.options,
          'metricSettings', mr.metric_settings,
          'sortOrder', mr.metric_sort_order,
          'isRequired', mr.is_required
        )
        order by mr.metric_sort_order, mr.name, mr.id
      ) as metrics
    from metric_rows mr
    group by mr.result_group_id
  ),
  groups_payload as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', rg.id,
          'code', rg.code,
          'name', rg.name,
          'sortOrder', rg.sort_order,
          'metrics', mbg.metrics
        )
        order by rg.sort_order, rg.name, rg.id
      ),
      '[]'::jsonb
    ) as groups
    from public.result_groups rg
    join metrics_by_group mbg on mbg.result_group_id = rg.id
    where rg.organization_id = p_organization_id
      and rg.is_active = true
  ),
  results_payload as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'metricId', sr.result_metric_id,
          'value', sr.value
        )
        order by sr.result_metric_id
      ),
      '[]'::jsonb
    ) as results
    from public.sample_results sr
    where sr.organization_id = p_organization_id
      and sr.sample_id = p_sample_id
  ),
  conclusions_payload as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'groupId', sgc.result_group_id,
          'kqChung', sgc.kq_chung
        )
        order by sgc.result_group_id
      ),
      '[]'::jsonb
    ) as conclusions
    from public.sample_group_conclusions sgc
    where sgc.organization_id = p_organization_id
      and sgc.sample_id = p_sample_id
  )
  select jsonb_build_object(
    'sample', jsonb_build_object(
      'id', s.id,
      'sampleCode', s.sample_code,
      'sampleTypeId', s.sample_type_id,
      'sampleTypeName', s.sample_type_name,
      'organizationId', s.organization_id,
      'receivedAt', s.received_at,
      'customerName', s.customer_name,
      'companyName', s.company_name,
      'status', s.status
    ),
    'template', jsonb_build_object(
      'id', st.id,
      'name', st.name
    ),
    'groups', gp.groups,
    'results', rp.results,
    'conclusions', cp.conclusions
  )
  from sample_row s
  join selected_template st on true
  cross join groups_payload gp
  cross join results_payload rp
  cross join conclusions_payload cp;
$$;

revoke all on function public.get_sample_result_entry_payload(
  uuid, uuid
) from public;
revoke all on function public.get_sample_result_entry_payload(
  uuid, uuid
) from anon;
revoke all on function public.get_sample_result_entry_payload(
  uuid, uuid
) from authenticated;
grant execute on function public.get_sample_result_entry_payload(
  uuid, uuid
) to service_role;
