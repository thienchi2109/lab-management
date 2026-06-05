-- US-005: individual kit unit inventory.

create type public.kit_status as enum (
  'in_stock',
  'assigned',
  'used',
  'void',
  'expired',
  'lost'
);

create table public.kits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kit_batch_id uuid not null references public.kit_batches(id) on delete restrict,
  kit_code text not null,
  status public.kit_status not null default 'in_stock',
  status_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists kits_org_code_key
  on public.kits (organization_id, kit_code);

create index if not exists kits_batch_id_idx on public.kits (kit_batch_id);
create index if not exists kits_org_status_idx
  on public.kits (organization_id, status, updated_at desc);

alter table public.kits enable row level security;

create policy "members can view kits"
  on public.kits for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can insert kits"
  on public.kits for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can update kits"
  on public.kits for update
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can delete kits"
  on public.kits for delete
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
