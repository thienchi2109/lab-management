-- US-006: sample metadata references and billing state.

create type public.sample_billing_status as enum (
  'unpaid',
  'invoiced',
  'paid',
  'eom_credit'
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  code text not null,
  name text not null,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

alter table public.samples
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists billing_status public.sample_billing_status not null default 'unpaid';

create index if not exists companies_org_active_idx
  on public.companies (organization_id, is_active, name);
create index if not exists customers_org_active_idx
  on public.customers (organization_id, is_active, name);
create index if not exists customers_company_id_idx
  on public.customers (company_id);
create index if not exists samples_customer_id_idx
  on public.samples (customer_id);
create index if not exists samples_company_id_idx
  on public.samples (company_id);
create index if not exists samples_org_billing_idx
  on public.samples (organization_id, billing_status, received_at desc);

alter table public.companies enable row level security;
alter table public.customers enable row level security;

create policy "members can view companies"
  on public.companies for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can insert companies"
  on public.companies for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can update companies"
  on public.companies for update
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "members can view customers"
  on public.customers for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can insert customers"
  on public.customers for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can update customers"
  on public.customers for update
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
