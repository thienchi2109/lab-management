-- US-004 follow-up: atomically replace result template metric assignments.

create or replace function public.replace_result_template_metrics(
  p_organization_id uuid,
  p_result_template_id uuid,
  p_metric_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  unique_metric_ids uuid[];
  invalid_metric_count integer;
begin
  if p_organization_id is null or p_result_template_id is null then
    raise exception 'organization_id and result_template_id are required';
  end if;

  select coalesce(array_agg(metric_id order by first_position), array[]::uuid[])
  into unique_metric_ids
  from (
    select metric_id, min(metric_position) as first_position
    from unnest(coalesce(p_metric_ids, array[]::uuid[]))
      with ordinality as metric(metric_id, metric_position)
    where metric_id is not null
    group by metric_id
  ) ordered_metrics;

  if not exists (
    select 1
    from public.result_templates
    where id = p_result_template_id
      and organization_id = p_organization_id
  ) then
    raise exception 'result template does not belong to organization';
  end if;

  select count(*)
  into invalid_metric_count
  from unnest(unique_metric_ids) as metric(metric_id)
  where not exists (
    select 1
    from public.result_metrics
    where id = metric.metric_id
      and organization_id = p_organization_id
  );

  if invalid_metric_count > 0 then
    raise exception 'result metrics must belong to organization';
  end if;

  delete from public.result_template_metrics
  where result_template_id = p_result_template_id
    and organization_id = p_organization_id;

  insert into public.result_template_metrics (
    organization_id,
    result_template_id,
    result_metric_id,
    sort_order
  )
  select
    p_organization_id,
    p_result_template_id,
    metric.metric_id,
    metric.metric_position * 10
  from unnest(unique_metric_ids) with ordinality as metric(metric_id, metric_position);
end;
$$;

revoke all on function public.replace_result_template_metrics(uuid, uuid, uuid[]) from public;
revoke all on function public.replace_result_template_metrics(uuid, uuid, uuid[]) from anon;
revoke all on function public.replace_result_template_metrics(uuid, uuid, uuid[]) from authenticated;
grant execute on function public.replace_result_template_metrics(uuid, uuid, uuid[]) to service_role;
