-- FB-20260621-03 review follow-up: VND amounts must be integer bounded.

do $$
begin
  if exists (
    select 1
    from public.samples
    where sample_cost_amount_vnd is not null
      and (
        sample_cost_amount_vnd <> trunc(sample_cost_amount_vnd)
        or sample_cost_amount_vnd > 999999999999999
      )
  ) then
    raise exception 'sample_cost_amount_vnd contains non-integer or out-of-range values';
  end if;
end;
$$;

alter table public.samples
  alter column sample_cost_amount_vnd
  type numeric(15, 0)
  using sample_cost_amount_vnd::numeric(15, 0);
