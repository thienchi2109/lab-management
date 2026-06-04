-- US-002: Supabase initial schema for MVP showcase.
-- Apply in a Supabase Postgres project after credentials are configured.

create extension if not exists "pgcrypto";

create schema if not exists private;

create type public.app_role as enum ('admin', 'editor', 'viewer');
create type public.sample_status as enum ('draft', 'received', 'in_progress', 'completed', 'archived');
create type public.result_input_type as enum (
  'number',
  'text',
  'textarea',
  'select',
  'multi_select',
  'boolean',
  'scale_1_5',
  'percent',
  'pcr_qualitative',
  'pcr_realtime'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.sample_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.kit_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  manufacturer text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.kit_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kit_type_id uuid not null references public.kit_types(id) on delete restrict,
  lot_number text not null,
  received_quantity integer not null check (received_quantity >= 0),
  remaining_quantity integer not null check (remaining_quantity >= 0),
  expires_on date,
  received_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, kit_type_id, lot_number),
  check (remaining_quantity <= received_quantity)
);

create table public.samples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_type_id uuid not null references public.sample_types(id) on delete restrict,
  kit_batch_id uuid references public.kit_batches(id) on delete set null,
  sample_code text not null,
  customer_name text,
  collected_at timestamptz,
  received_at timestamptz not null default now(),
  status public.sample_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sample_code)
);

create table public.sample_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  content_type text,
  size_bytes integer check (size_bytes is null or size_bytes <= 5242880),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (sample_id, storage_path)
);

create table public.result_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.result_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  result_group_id uuid not null references public.result_groups(id) on delete cascade,
  code text not null,
  name text not null,
  input_type public.result_input_type not null,
  unit text,
  options jsonb not null default '[]'::jsonb,
  metric_settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_required boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, result_group_id, code)
);

create table public.result_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_type_id uuid not null references public.sample_types(id) on delete restrict,
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.result_template_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  result_template_id uuid not null references public.result_templates(id) on delete cascade,
  result_metric_id uuid not null references public.result_metrics(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (result_template_id, result_metric_id)
);

create table public.sample_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  result_metric_id uuid not null references public.result_metrics(id) on delete restrict,
  value jsonb not null,
  entered_by uuid references auth.users(id) on delete set null,
  entered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sample_id, result_metric_id)
);

create table public.sample_group_conclusions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  result_group_id uuid not null references public.result_groups(id) on delete restrict,
  kq_chung text not null,
  calculated_from jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sample_id, result_group_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index tenant_memberships_user_org_idx on public.tenant_memberships (user_id, organization_id) where is_active;
create index tenant_memberships_org_role_idx on public.tenant_memberships (organization_id, role) where is_active;
create index sample_types_org_active_idx on public.sample_types (organization_id, is_active);
create index kit_types_org_active_idx on public.kit_types (organization_id, is_active);
create index kit_batches_org_expires_idx on public.kit_batches (organization_id, expires_on);
create index samples_org_status_received_idx on public.samples (organization_id, status, received_at desc);
create index samples_metadata_gin_idx on public.samples using gin (metadata);
create index sample_images_sample_idx on public.sample_images (sample_id);
create index result_groups_org_active_idx on public.result_groups (organization_id, is_active, sort_order);
create index result_metrics_org_group_idx on public.result_metrics (organization_id, result_group_id, sort_order);
create index result_templates_org_sample_type_idx on public.result_templates (organization_id, sample_type_id);
create index result_template_metrics_template_idx on public.result_template_metrics (result_template_id, sort_order);
create index sample_results_sample_idx on public.sample_results (sample_id);
create index sample_group_conclusions_sample_idx on public.sample_group_conclusions (sample_id);
create index audit_events_org_created_idx on public.audit_events (organization_id, created_at desc);

create or replace function private.has_org_role(
  target_organization_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = private, public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.tenant_memberships tm
      where tm.organization_id = target_organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = any(allowed_roles)
        and tm.is_active
    );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on function private.has_org_role(uuid, public.app_role[]) from public;
grant execute on function private.has_org_role(uuid, public.app_role[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.sample_types enable row level security;
alter table public.kit_types enable row level security;
alter table public.kit_batches enable row level security;
alter table public.samples enable row level security;
alter table public.sample_images enable row level security;
alter table public.result_groups enable row level security;
alter table public.result_metrics enable row level security;
alter table public.result_templates enable row level security;
alter table public.result_template_metrics enable row level security;
alter table public.sample_results enable row level security;
alter table public.sample_group_conclusions enable row level security;
alter table public.audit_events enable row level security;

create policy "members can view organizations"
  on public.organizations for select
  to authenticated
  using (private.has_org_role(id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can update organizations"
  on public.organizations for update
  to authenticated
  using (private.has_org_role(id, array['admin']::public.app_role[]))
  with check (private.has_org_role(id, array['admin']::public.app_role[]));

create policy "users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() is not null and id = (select auth.uid()));

create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() is not null and id = (select auth.uid()))
  with check (auth.uid() is not null and id = (select auth.uid()));

create policy "members can view tenant memberships"
  on public.tenant_memberships for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage tenant memberships"
  on public.tenant_memberships for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view sample types"
  on public.sample_types for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage sample types"
  on public.sample_types for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view kit types"
  on public.kit_types for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage kit types"
  on public.kit_types for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view kit batches"
  on public.kit_batches for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can manage kit batches"
  on public.kit_batches for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "members can view samples"
  on public.samples for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can manage samples"
  on public.samples for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "members can view sample images"
  on public.sample_images for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can manage sample images"
  on public.sample_images for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "members can view result groups"
  on public.result_groups for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage result groups"
  on public.result_groups for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view result metrics"
  on public.result_metrics for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage result metrics"
  on public.result_metrics for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view result templates"
  on public.result_templates for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage result templates"
  on public.result_templates for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view result template metrics"
  on public.result_template_metrics for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "admins can manage result template metrics"
  on public.result_template_metrics for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members can view sample results"
  on public.sample_results for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can manage sample results"
  on public.sample_results for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "members can view sample group conclusions"
  on public.sample_group_conclusions for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "editors can manage sample group conclusions"
  on public.sample_group_conclusions for all
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "members can view audit events"
  on public.audit_events for select
  to authenticated
  using (private.has_org_role(organization_id, array['admin','editor','viewer']::public.app_role[]));

create policy "system can insert audit events"
  on public.audit_events for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
