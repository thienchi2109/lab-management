-- FB-20260621-03: durable sample cost columns for reporting and visualization.

alter table public.samples
  add column if not exists sample_cost_amount_vnd numeric,
  add column if not exists sample_cost_payment_method text;

alter table public.samples
  add constraint samples_sample_cost_amount_vnd_nonnegative
    check (sample_cost_amount_vnd is null or sample_cost_amount_vnd >= 0),
  add constraint samples_sample_cost_payment_method_check
    check (
      sample_cost_payment_method is null
      or sample_cost_payment_method in ('cash', 'bank_transfer', 'other')
    );

create index if not exists samples_org_cost_status_idx
  on public.samples (
    organization_id,
    billing_status,
    sample_cost_payment_method
  )
  where sample_cost_amount_vnd is not null;
